export enum BalanceType {
  FOOD = 'food',
  MEAL = 'meal',
  CASH = 'cash',
}

export type AccountBalance = {
  [k in BalanceType]: number;
};

export class Account {
  constructor(
    readonly id: string,
    readonly ownerName: string,
    readonly balance: AccountBalance,
  ) {}

  calculateBalance(amount: number, type: BalanceType): AccountBalance {
    if (amount <= this.balance[type]) {
      return {
        ...this.balance,
        [type]: this.balance[type] - amount,
      };
    }

    const fallbackAmount = amount - this.balance[type];
    if (
      type !== BalanceType.CASH &&
      fallbackAmount <= this.balance[BalanceType.CASH]
    ) {
      return {
        ...this.balance,
        [BalanceType.CASH]: this.balance[BalanceType.CASH] - fallbackAmount,
        [type]: 0,
      };
    }

    return undefined;
  }
}
