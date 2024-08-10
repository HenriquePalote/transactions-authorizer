import { Injectable } from '@nestjs/common';
import { Transaction } from '../transaction';
import { AccountRepository } from '../repository/account.repository';
import { MerchantRepository } from '../repository/merchant.repository';
import { retry } from '../../../common/utils/retry';
import {
  ErrorTransaction,
  NoBalanceTransaction,
  SuccessfulTransaction,
  TransactionResult,
} from '../authorization-results';

const AUTHORIZATION_RETRIES = 5;

@Injectable()
export class AuthorizeTransactionUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly merchantRepository: MerchantRepository,
  ) {}

  async execute(transaction: Transaction): Promise<TransactionResult> {
    try {
      const mccOfMerchant = await this.merchantRepository.findMCC(
        transaction.merchant,
      );
      if (mccOfMerchant) {
        transaction.mcc = mccOfMerchant;
      }

      return await retry(AUTHORIZATION_RETRIES, async () =>
        this.processTransaction(transaction),
      );
    } catch (error) {
      return new ErrorTransaction();
    }
  }

  private async processTransaction(
    transaction: Transaction,
  ): Promise<TransactionResult> {
    const account = await this.accountRepository.findById(transaction.account);
    if (!account) {
      return new ErrorTransaction();
    }

    const newBalance = account.calculateBalance(
      transaction.amount,
      transaction.mccToBalanceType(),
    );
    if (newBalance) {
      await this.accountRepository.authorizeTransaction(
        account,
        newBalance,
        transaction,
      );
      return new SuccessfulTransaction();
    }

    return new NoBalanceTransaction();
  }
}
