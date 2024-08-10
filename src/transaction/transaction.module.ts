import { Module } from '@nestjs/common';
import { AuthorizeTransactionController } from './application/api/authorize-transaction.controller';
import { AuthorizeTransactionUseCase } from './domain/use-case/authorize-transaction.use-case';
import { AccountRepository } from './domain/repository/account.repository';

import { MerchantRepository } from './domain/repository/merchant.repository';

import { PGAccountRepository } from './application/database/pg/pg-account.repository';
import { PGMerchantRepository } from './application/database/pg/pg-merchant.repository';
import { DatabaseModule } from '@app/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthorizeTransactionController],
  providers: [
    AuthorizeTransactionUseCase,
    {
      provide: AccountRepository,
      useClass: PGAccountRepository,
    },
    {
      provide: MerchantRepository,
      useClass: PGMerchantRepository,
    },
  ],
})
export class TransactionModule {}
