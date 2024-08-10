import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TransactionRequest } from './request/transaction.request';
import { AuthorizeTransactionUseCase } from '../../domain/use-case/authorize-transaction.use-case';
import { Transaction } from '../../domain/transaction';
import { ErrorTransaction } from '@app/transaction/domain/authorization-results';

@Controller('transactions')
export class AuthorizeTransactionController {
  constructor(private readonly useCase: AuthorizeTransactionUseCase) {}

  @HttpCode(200)
  @Post('authorize')
  async authorize(@Body() transactionRequest: TransactionRequest) {
    if (TransactionRequest.safeParse(transactionRequest).success) {
      const transaction = new Transaction(
        transactionRequest.id,
        transactionRequest.account,
        transactionRequest.amount,
        transactionRequest.merchant,
        transactionRequest.mcc,
      );

      const result = await this.useCase.execute(transaction);
      return result;
    }

    return new ErrorTransaction();
  }
}
