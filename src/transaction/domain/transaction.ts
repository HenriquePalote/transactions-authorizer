import { BalanceType } from './account';

export const FoodMCCs = ['5411', '5412'];
export const MealMCCs = ['5811', '5812'];

export const MCCValues = [...FoodMCCs, ...MealMCCs] as const;
export type MCCValue = (typeof MCCValues)[number];

export class Transaction {
  constructor(
    readonly id: string,
    readonly account: string,
    readonly amount: number,
    readonly merchant: string,
    public mcc: MCCValue,
  ) {}

  mccToBalanceType(): BalanceType {
    if (FoodMCCs.includes(this.mcc)) {
      return BalanceType.FOOD;
    } else if (MealMCCs.includes(this.mcc)) {
      return BalanceType.MEAL;
    } else {
      return BalanceType.CASH;
    }
  }
}
