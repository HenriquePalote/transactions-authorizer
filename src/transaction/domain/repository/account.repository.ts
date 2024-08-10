import { Account, AccountBalance } from '../account';
import { Transaction } from '../transaction';

export abstract class AccountRepository {
  abstract findById(accountId: string): Promise<Account>;
  abstract authorizeTransaction(
    account: Account,
    balance: AccountBalance,
    transaction: Transaction,
  ): Promise<void>;
}
