import { BalanceType } from '@app/transaction/domain/account';
import {
  FoodMCCs,
  MealMCCs,
  Transaction,
} from '@app/transaction/domain/transaction';
import { randomUUID } from 'crypto';

describe('Transaction', () => {
  describe('mccToBalanceType', () => {
    it.each(FoodMCCs)('should return food', (mcc: string) => {
      const transaction = new Transaction(
        randomUUID(),
        randomUUID(),
        100,
        'PADARIA',
        mcc,
      );

      expect(transaction.mccToBalanceType()).toBe(BalanceType.FOOD);
    });

    it.each(MealMCCs)('should return meal', (mcc: string) => {
      const transaction = new Transaction(
        randomUUID(),
        randomUUID(),
        100,
        'PADARIA',
        mcc,
      );

      expect(transaction.mccToBalanceType()).toBe(BalanceType.MEAL);
    });

    it("should return cash when mcc isn't food or meal", () => {
      const transaction = new Transaction(
        randomUUID(),
        randomUUID(),
        100,
        'PADARIA',
        '1111',
      );

      expect(transaction.mccToBalanceType()).toBe(BalanceType.CASH);
    });
  });
});
