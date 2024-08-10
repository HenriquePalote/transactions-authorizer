import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexWrapper } from '@app/common/database/knex.wrapper';
import { AccountRepository } from '@app/transaction/domain/repository/account.repository';
import {
  Account,
  AccountBalance,
  BalanceType,
} from '@app/transaction/domain/account';
import { Transaction } from '@app/transaction/domain/transaction';

export interface AccountSchema {
  id: string;
  ownerName: string;
  food: number;
  meal: number;
  cash: number;
}

@Injectable()
export class PGAccountRepository implements AccountRepository {
  private readonly databaseClient: Knex;

  constructor(knexWrapper: KnexWrapper) {
    this.databaseClient = knexWrapper.getKnexClient();
  }

  async findById(accountId: string): Promise<Account> {
    const accountData = await this.databaseClient
      .select<AccountSchema>('*')
      .where({ id: accountId })
      .from('accounts')
      .first();
    if (accountData) {
      return new Account(accountData.id, accountData.ownerName, {
        cash: accountData.cash,
        food: accountData.food,
        meal: accountData.meal,
      });
    }
    return undefined;
  }

  async authorizeTransaction(
    account: Account,
    balance: AccountBalance,
    transaction: Transaction,
  ): Promise<void> {
    const trx = await this.databaseClient.transaction();
    const databaseAccount = await trx
      .select()
      .where({ id: account.id })
      .from('accounts')
      .forUpdate()
      .first();

    const hasChanged = this.hasBalanceChanges(account, databaseAccount);
    if (hasChanged) {
      await trx.rollback();
      throw new Error('Transaction conflicting');
    }

    await trx.where({ id: account.id }).from('accounts').update(balance);
    await trx.into('transactions').insert(transaction);
    await trx.commit();
  }

  private hasBalanceChanges(
    currAccount: Account,
    databaseAccount: AccountSchema,
  ) {
    return (
      currAccount.balance[BalanceType.CASH] !== databaseAccount.cash ||
      currAccount.balance[BalanceType.FOOD] !== databaseAccount.food ||
      currAccount.balance[BalanceType.MEAL] !== databaseAccount.meal
    );
  }
}
