#![no_std]
#![allow(clippy::too_many_arguments)]
use soroban_sdk::{
    contract, contractclient, contractimpl, contracttype, Address, Env, String, Symbol, Vec,
};

#[contractclient(name = "ReputationClient")]
pub trait ReputationContractTrait {
    fn update_score(env: Env, wallet: Address, action: Symbol) -> ReputationInfo;
}

// Temporary copy of ReputationInfo structure for type matching
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationInfo {
    pub wallet: Address,
    pub completed_leases: u32,
    pub successful_payments: u32,
    pub disputes: u32,
    pub trust_score: u32,
}

#[contractclient(name = "EscrowClient")]
pub trait EscrowContractTrait {
    fn lock_deposit(
        env: Env,
        token_address: Address,
        lease_id: String,
        tenant: Address,
        landlord: Address,
        deposit_amount: i128,
    );
    fn release_deposit(env: Env, token_address: Address, lease_id: String);
    fn refund_deposit(env: Env, token_address: Address, lease_id: String);
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LeaseStatus {
    Created,
    Active,
    Terminated,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LeaseInfo {
    pub lease_id: String,
    pub tenant: Address,
    pub landlord: Address,
    pub property_id: String,
    pub rent_amount: i128,
    pub deposit_amount: i128,
    pub start_date: u64,
    pub end_date: u64,
    pub status: LeaseStatus,
}

#[contracttype]
pub enum DataKey {
    Lease(String),
    LeaseList,
}

#[contract]
pub struct LeaseContract;

#[contractimpl]
impl LeaseContract {
    pub fn create_lease(
        env: Env,
        lease_id: String,
        tenant: Address,
        landlord: Address,
        property_id: String,
        rent_amount: i128,
        deposit_amount: i128,
        start_date: u64,
        end_date: u64,
    ) -> LeaseInfo {
        landlord.require_auth();

        let info = LeaseInfo {
            lease_id: lease_id.clone(),
            tenant,
            landlord,
            property_id,
            rent_amount,
            deposit_amount,
            start_date,
            end_date,
            status: LeaseStatus::Created,
        };

        // Save Lease
        let key = DataKey::Lease(lease_id.clone());
        env.storage().persistent().set(&key, &info);

        // Add to Lease List
        let mut list = Self::list_leases(env.clone());
        list.push_back(lease_id.clone());
        env.storage().persistent().set(&DataKey::LeaseList, &list);

        // Publish event
        env.events()
            .publish((Symbol::new(&env, "LeaseCreated"), lease_id), rent_amount);

        info
    }

    pub fn approve_lease(
        env: Env,
        token_address: Address,
        escrow_contract: Address,
        lease_id: String,
    ) -> LeaseInfo {
        let key = DataKey::Lease(lease_id.clone());
        let mut info = env
            .storage()
            .persistent()
            .get::<_, LeaseInfo>(&key)
            .unwrap();

        assert_eq!(
            info.status,
            LeaseStatus::Created,
            "Lease must be in Created state"
        );

        // Lock deposit: Tenant must sign this call since lock_deposit requires tenant's auth
        info.tenant.require_auth();

        let escrow_client = EscrowClient::new(&env, &escrow_contract);
        escrow_client.lock_deposit(
            &token_address,
            &lease_id,
            &info.tenant,
            &info.landlord,
            &info.deposit_amount,
        );

        info.status = LeaseStatus::Active;
        env.storage().persistent().set(&key, &info);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "LeaseApproved"), lease_id),
            info.deposit_amount,
        );

        info
    }

    pub fn terminate_lease(
        env: Env,
        token_address: Address,
        escrow_contract: Address,
        reputation_contract: Address,
        lease_id: String,
        payout_recipient: Address, // tenant or landlord
        terminator: Address,
    ) -> LeaseInfo {
        let key = DataKey::Lease(lease_id.clone());
        let mut info = env
            .storage()
            .persistent()
            .get::<_, LeaseInfo>(&key)
            .unwrap();

        assert_eq!(
            info.status,
            LeaseStatus::Active,
            "Lease must be in Active state"
        );

        // Verify terminator is landlord or tenant and has signed
        assert!(
            terminator == info.landlord || terminator == info.tenant,
            "Only tenant or landlord can terminate"
        );
        terminator.require_auth();

        // Refund/Release deposit based on payout recipient
        let escrow_client = EscrowClient::new(&env, &escrow_contract);
        if payout_recipient == info.tenant {
            escrow_client.refund_deposit(&token_address, &lease_id);
        } else {
            escrow_client.release_deposit(&token_address, &lease_id);
        }

        info.status = LeaseStatus::Terminated;
        env.storage().persistent().set(&key, &info);

        // Update reputations: completed lease updates trust score
        let rep_client = ReputationClient::new(&env, &reputation_contract);
        rep_client.update_score(&info.tenant, &Symbol::new(&env, "complete"));
        rep_client.update_score(&info.landlord, &Symbol::new(&env, "complete"));

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "LeaseTerminated"), lease_id),
            info.deposit_amount,
        );

        info
    }

    pub fn get_lease(env: Env, lease_id: String) -> Option<LeaseInfo> {
        let key = DataKey::Lease(lease_id);
        env.storage().persistent().get::<_, LeaseInfo>(&key)
    }

    pub fn list_leases(env: Env) -> Vec<String> {
        env.storage()
            .persistent()
            .get::<_, Vec<String>>(&DataKey::LeaseList)
            .unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use chainrent_escrow::EscrowContract;
    use chainrent_reputation::ReputationContract;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env, String};

    #[test]
    fn test_lease_inter_contract_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let reputation_id = env.register(ReputationContract, ());
        let escrow_id = env.register(EscrowContract, ());
        let lease_id = env.register(LeaseContract, ());

        let lease_client = LeaseContractClient::new(&env, &lease_id);

        let tenant = Address::generate(&env);
        let landlord = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_id = env
            .register_stellar_asset_contract_v2(token_admin.clone())
            .address();
        let token_client = soroban_sdk::token::Client::new(&env, &token_id);

        let deposit_amount = 1000i128;
        let rent_amount = 500i128;

        let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&tenant, &deposit_amount);

        let lease_uuid = String::from_str(&env, "lease_uuid_123");
        let property_uuid = String::from_str(&env, "property_uuid_456");

        // 1. Create Lease
        let created_lease = lease_client.create_lease(
            &lease_uuid,
            &tenant,
            &landlord,
            &property_uuid,
            &rent_amount,
            &deposit_amount,
            &10000u64,
            &20000u64,
        );
        assert_eq!(created_lease.status, LeaseStatus::Created);

        // Verify it was saved and listed
        let fetched_lease = lease_client.get_lease(&lease_uuid).unwrap();
        assert_eq!(fetched_lease.status, LeaseStatus::Created);

        let list = lease_client.list_leases();
        assert_eq!(list.len(), 1);
        assert_eq!(list.get(0).unwrap(), lease_uuid);

        // 2. Approve Lease (triggers lock_deposit on escrow)
        let approved_lease = lease_client.approve_lease(&token_id, &escrow_id, &lease_uuid);
        assert_eq!(approved_lease.status, LeaseStatus::Active);

        // Verify tokens are now locked in escrow contract address
        assert_eq!(token_client.balance(&tenant), 0);
        assert_eq!(token_client.balance(&escrow_id), deposit_amount);

        // 3. Terminate Lease (triggers release_deposit/refund_deposit on escrow + Reputation increase)
        let terminated_lease = lease_client.terminate_lease(
            &token_id,
            &escrow_id,
            &reputation_id,
            &lease_uuid,
            &tenant, // refund to tenant
            &tenant, // terminator
        );
        assert_eq!(terminated_lease.status, LeaseStatus::Terminated);

        // Verify tokens are refunded to Tenant
        assert_eq!(token_client.balance(&tenant), deposit_amount);
        assert_eq!(token_client.balance(&escrow_id), 0);
    }

    #[test]
    #[should_panic(expected = "Only tenant or landlord can terminate")]
    fn test_lease_unauthorized_termination() {
        let env = Env::default();
        env.mock_all_auths();

        let reputation_id = env.register(ReputationContract, ());
        let escrow_id = env.register(EscrowContract, ());
        let lease_id = env.register(LeaseContract, ());
        let lease_client = LeaseContractClient::new(&env, &lease_id);

        let tenant = Address::generate(&env);
        let landlord = Address::generate(&env);
        let intruder = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_id = env
            .register_stellar_asset_contract_v2(token_admin.clone())
            .address();
        let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&tenant, &1000i128);

        let lease_uuid = String::from_str(&env, "lease_uuid_123");
        let property_uuid = String::from_str(&env, "property_uuid_456");

        lease_client.create_lease(
            &lease_uuid,
            &tenant,
            &landlord,
            &property_uuid,
            &500i128,
            &1000i128,
            &10000u64,
            &20000u64,
        );

        lease_client.approve_lease(&token_id, &escrow_id, &lease_uuid);

        lease_client.terminate_lease(
            &token_id,
            &escrow_id,
            &reputation_id,
            &lease_uuid,
            &tenant,
            &intruder,
        );
    }
}
