import { AccountRepository } from '@app/transaction/domain/repository/account.repository';

export class MockAccountRepository implements AccountRepository {
  authorizeTransaction = jest.fn();
  findById = jest.fn();
}
