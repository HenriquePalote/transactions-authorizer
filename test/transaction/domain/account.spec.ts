import { Account, BalanceType } from '@app/transaction/domain/account';
import { randomUUID } from 'crypto';

describe('Account', () => {
  it.each([BalanceType.FOOD, BalanceType.MEAL, BalanceType.CASH])(
    'should reduce %s balance when has sufficient amount',
    (balanceType) => {
      const account = new Account(randomUUID(), 'Henrique', {
        cash: 100,
        food: 100,
        meal: 100,
      });

      const amount = 50;
      const newBalance = account.calculateBalance(amount, balanceType);
      expect(newBalance[balanceType]).toBe(50);
    },
  );

  it.each([BalanceType.FOOD, BalanceType.MEAL, BalanceType.CASH])(
    'should return undefined when %s has insufficient amount',
    (balanceType) => {
      const account = new Account(randomUUID(), 'Henrique', {
        cash: 100,
        food: 100,
        meal: 100,
      });

      const amount = 300;
      const newBalance = account.calculateBalance(amount, balanceType);
      expect(newBalance).toBeUndefined();
    },
  );

  it.each([BalanceType.FOOD, BalanceType.MEAL])(
    'should reduce balance using cash fallback when %s has insufficient amount',
    (balanceType) => {
      const account = new Account(randomUUID(), 'Henrique', {
        cash: 100,
        food: 100,
        meal: 100,
      });

      const amount = 150;
      const newBalance = account.calculateBalance(amount, balanceType);
      expect(newBalance[balanceType]).toBe(0);
      expect(newBalance.cash).toBe(50);
    },
  );
});
