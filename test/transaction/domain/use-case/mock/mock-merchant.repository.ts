import { MerchantRepository } from '@app/transaction/domain/repository/merchant.repository';

export class MockMerchantRepository implements MerchantRepository {
  findMCC = jest.fn();
}
