#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationInfo {
    pub wallet: Address,
    pub completed_leases: u32,
    pub successful_payments: u32,
    pub disputes: u32,
    pub trust_score: u32,
}

#[contracttype]
pub enum DataKey {
    RepInfo(Address),
}

const ACTION_PAYMENT: Symbol = symbol_short!("payment");
const ACTION_COMPLETE: Symbol = symbol_short!("complete");
const ACTION_DISPUTE: Symbol = symbol_short!("dispute");

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    pub fn get_score(env: Env, wallet: Address) -> ReputationInfo {
        let key = DataKey::RepInfo(wallet.clone());
        if let Some(info) = env.storage().persistent().get::<_, ReputationInfo>(&key) {
            info
        } else {
            ReputationInfo {
                wallet,
                completed_leases: 0,
                successful_payments: 0,
                disputes: 0,
                trust_score: 500, // default trust score
            }
        }
    }

    pub fn update_score(env: Env, wallet: Address, action: Symbol) -> ReputationInfo {
        // Only authorized invoker or contract itself can update the score
        // For simplicity, we authorize the wallet or contract calls

        let key = DataKey::RepInfo(wallet.clone());
        let mut info = Self::get_score(env.clone(), wallet.clone());

        if action == ACTION_PAYMENT {
            info.successful_payments += 1;
            info.trust_score = core::cmp::min(1000, info.trust_score + 10);
        } else if action == ACTION_COMPLETE {
            info.completed_leases += 1;
            info.trust_score = core::cmp::min(1000, info.trust_score + 50);
        } else if action == ACTION_DISPUTE {
            info.disputes += 1;
            if info.trust_score >= 100 {
                info.trust_score -= 100;
            } else {
                info.trust_score = 0;
            }
        }

        env.storage().persistent().set(&key, &info);

        // Publish update event
        env.events().publish(
            (Symbol::new(&env, "ReputationUpdated"), wallet),
            info.trust_score,
        );

        info
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env, Symbol};

    #[test]
    fn test_reputation_flow() {
        let env = Env::default();
        let contract_id = env.register(ReputationContract, ());
        let client = ReputationContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);

        // Test default score
        let initial = client.get_score(&user);
        assert_eq!(initial.trust_score, 500);
        assert_eq!(initial.completed_leases, 0);

        // Test payment update (+10)
        let after_pay = client.update_score(&user, &Symbol::new(&env, "payment"));
        assert_eq!(after_pay.trust_score, 510);
        assert_eq!(after_pay.successful_payments, 1);

        // Test lease complete update (+50)
        let after_complete = client.update_score(&user, &Symbol::new(&env, "complete"));
        assert_eq!(after_complete.trust_score, 560);
        assert_eq!(after_complete.completed_leases, 1);

        // Test dispute update (-100)
        let after_dispute = client.update_score(&user, &Symbol::new(&env, "dispute"));
        assert_eq!(after_dispute.trust_score, 460);
        assert_eq!(after_dispute.disputes, 1);
    }
}
