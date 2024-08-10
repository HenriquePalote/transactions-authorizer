import { KnexWrapper } from '@app/common/database/knex.wrapper';
import {
  MerchantSchema,
  PGMerchantRepository,
} from '@app/transaction/application/database/pg/pg-merchant.repository';
import { TestBed } from '@automock/jest';

describe('PGMerchantRepository', () => {
  describe('findMCC', () => {
    const createQueryBuilder = () => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined),
    });

    it('should return MCC when found merchant', async () => {
      const merchant: MerchantSchema = {
        identifier: 'PADARIA DO BAIRRO',
        name: 'Padaria do Bairro',
        mcc: '4223',
      };

      const queryBuilder = createQueryBuilder();
      queryBuilder.first.mockResolvedValue(merchant);

      const { unit: repository } = TestBed.create(PGMerchantRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const result = await repository.findMCC(merchant.identifier);
      expect(result).toEqual(merchant.mcc);
    });

    it("should return undefined when didn't found merchant", async () => {
      const queryBuilder = createQueryBuilder();

      const { unit: repository } = TestBed.create(PGMerchantRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const result = await repository.findMCC('PADARIA');
      expect(result).toBeUndefined();
    });

    it('should query merchant', async () => {
      const queryBuilder = createQueryBuilder();

      const { unit: repository } = TestBed.create(PGMerchantRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      await repository.findMCC('PADARIA');
      expect(queryBuilder.select).toHaveBeenCalledTimes(1);
      expect(queryBuilder.where).toHaveBeenCalledWith({
        identifier: 'PADARIA',
      });
      expect(queryBuilder.from).toHaveBeenCalledWith('merchants');
      expect(queryBuilder.first).toHaveBeenCalledTimes(1);
    });
  });
});
