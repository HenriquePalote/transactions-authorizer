import { Module } from '@nestjs/common';
import { TransactionModule } from '@app/transaction/transaction.module';

@Module({
  imports: [TransactionModule],
})
export class AppModule {}
