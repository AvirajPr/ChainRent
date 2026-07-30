#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Locked,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowInfo {
    pub lease_id: String,
    pub tenant: Address,
    pub landlord: Address,
    pub deposit_amount: i128,
    pub status: EscrowStatus,
}

#[contracttype]
pub enum DataKey {
    Escrow(String),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn lock_deposit(
        env: Env,
        token_address: Address,
        lease_id: String,
        tenant: Address,
        landlord: Address,
        deposit_amount: i128,
    ) {
        tenant.require_auth();

        // Transfer funds from tenant to the contract address
        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&tenant, &contract_address, &deposit_amount);

        let info = EscrowInfo {
            lease_id: lease_id.clone(),
            tenant: tenant.clone(),
            landlord,
            deposit_amount,
            status: EscrowStatus::Locked,
        };

        let key = DataKey::Escrow(lease_id.clone());
        env.storage().persistent().set(&key, &info);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "DepositLocked"), lease_id),
            deposit_amount,
        );
    }

    pub fn release_deposit(env: Env, token_address: Address, lease_id: String) {
        let key = DataKey::Escrow(lease_id.clone());
        let mut info = env
            .storage()
            .persistent()
            .get::<_, EscrowInfo>(&key)
            .unwrap();

        assert_eq!(info.status, EscrowStatus::Locked, "Deposit must be locked");

        // Transfer from contract to landlord
        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&contract_address, &info.landlord, &info.deposit_amount);

        info.status = EscrowStatus::Released;
        env.storage().persistent().set(&key, &info);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "DepositReleased"), lease_id),
            info.deposit_amount,
        );
    }

    pub fn refund_deposit(env: Env, token_address: Address, lease_id: String) {
        let key = DataKey::Escrow(lease_id.clone());
        let mut info = env
            .storage()
            .persistent()
            .get::<_, EscrowInfo>(&key)
            .unwrap();

        assert_eq!(info.status, EscrowStatus::Locked, "Deposit must be locked");

        // Transfer from contract to tenant
        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&contract_address, &info.tenant, &info.deposit_amount);

        info.status = EscrowStatus::Refunded;
        env.storage().persistent().set(&key, &info);

        // Publish event
        env.events().publish(
            (Symbol::new(&env, "DepositRefunded"), lease_id),
            info.deposit_amount,
        );
    }

    pub fn get_escrow(env: Env, lease_id: String) -> Option<EscrowInfo> {
        let key = DataKey::Escrow(lease_id);
        env.storage().persistent().get::<_, EscrowInfo>(&key)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address, String};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_escrow_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let escrow_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(&env, &escrow_id);

        let tenant = Address::generate(&env);
        let landlord = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let token_client = token::Client::new(&env, &token_id);

        let deposit_amount = 1000i128;
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&tenant, &deposit_amount);

        assert_eq!(token_client.balance(&tenant), deposit_amount);

        let lease_id = String::from_str(&env, "lease_1");
        client.lock_deposit(&token_id, &lease_id, &tenant, &landlord, &deposit_amount);

        assert_eq!(token_client.balance(&tenant), 0);
        assert_eq!(token_client.balance(&escrow_id), deposit_amount);

        let escrow = client.get_escrow(&lease_id).unwrap();
        assert_eq!(escrow.status, EscrowStatus::Locked);

        client.release_deposit(&token_id, &lease_id);
        assert_eq!(token_client.balance(&escrow_id), 0);
        assert_eq!(token_client.balance(&landlord), deposit_amount);

        let escrow_after = client.get_escrow(&lease_id).unwrap();
        assert_eq!(escrow_after.status, EscrowStatus::Released);
    }

    #[test]
    fn test_escrow_refund() {
        let env = Env::default();
        env.mock_all_auths();

        let escrow_id = env.register(EscrowContract, ());
        let client = EscrowContractClient::new(&env, &escrow_id);

        let tenant = Address::generate(&env);
        let landlord = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let token_client = token::Client::new(&env, &token_id);

        let deposit_amount = 1000i128;
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
        token_admin_client.mint(&tenant, &deposit_amount);

        let lease_id = String::from_str(&env, "lease_2");
        client.lock_deposit(&token_id, &lease_id, &tenant, &landlord, &deposit_amount);

        client.refund_deposit(&token_id, &lease_id);
        assert_eq!(token_client.balance(&escrow_id), 0);
        assert_eq!(token_client.balance(&tenant), deposit_amount);

        let escrow_after = client.get_escrow(&lease_id).unwrap();
        assert_eq!(escrow_after.status, EscrowStatus::Refunded);
    }
}
