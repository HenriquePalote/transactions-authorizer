export interface TransactionResult {
  code: string;
}

export class SuccessfulTransaction implements TransactionResult {
  code = '00';
}

export class NoBalanceTransaction implements TransactionResult {
  code = '51';
}

export class ErrorTransaction implements TransactionResult {
  code = '07';
}
