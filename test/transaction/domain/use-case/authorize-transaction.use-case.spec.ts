import { Account, AccountBalance } from '@app/transaction/domain/account';
import {
  ErrorTransaction,
  NoBalanceTransaction,
  SuccessfulTransaction,
} from '@app/transaction/domain/authorization-results';
import { Transaction } from '@app/transaction/domain/transaction';
import { AuthorizeTransactionUseCase } from '@app/transaction/domain/use-case/authorize-transaction.use-case';
import { randomUUID } from 'crypto';
import { MockAccountRepository } from './mock/mock-account.repository';
import { MockMerchantRepository } from './mock/mock-merchant.repository';

describe('AuthorizeTransactionUseCase', () => {
  describe('execute', () => {
    const createTransaction = (amount?: number, mcc?: string) =>
      new Transaction(
        randomUUID(),
        randomUUID(),
        amount || 100,
        'PADARIA',
        mcc || '3123',
      );

    const createAccount = (accountId: string, balance: AccountBalance) =>
      new Account(accountId, 'Henrique', balance);

    it('should return no balance transaction when account has no balance', async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction();
      const account = createAccount(transaction.account, {
        cash: 0,
        food: 0,
        meal: 0,
      });

      accountRepository.findById.mockResolvedValue(account);

      expect(await useCase.execute(transaction)).toEqual(
        new NoBalanceTransaction(),
      );
    });

    it('should return no balance transaction when account has insufficient balance', async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction(100);
      const account = createAccount(transaction.account, {
        cash: 50,
        food: 50,
        meal: 50,
      });

      accountRepository.findById.mockResolvedValue(account);

      expect(await useCase.execute(transaction)).toEqual(
        new NoBalanceTransaction(),
      );
    });

    it('should return successful transaction when account has sufficient balance', async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction(10);
      const account = createAccount(transaction.account, {
        cash: 50,
        food: 50,
        meal: 50,
      });

      accountRepository.findById.mockResolvedValue(account);

      expect(await useCase.execute(transaction)).toEqual(
        new SuccessfulTransaction(),
      );
    });

    it('should return error transaction when error occurs', async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction();
      const account = createAccount(transaction.account, {
        cash: 100,
        food: 100,
        meal: 100,
      });

      accountRepository.findById.mockResolvedValue(account);
      accountRepository.authorizeTransaction.mockRejectedValue(
        new Error('error'),
      );

      expect(await useCase.execute(transaction)).toEqual(
        new ErrorTransaction(),
      );
    });

    it("should return error transaction when account doesn't exist", async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction();
      accountRepository.findById.mockResolvedValue(undefined);

      expect(await useCase.execute(transaction)).toEqual(
        new ErrorTransaction(),
      );
    });

    it("should maintain mcc of transaction when merchant doesn't exist", async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction();
      const account = createAccount(transaction.account, {
        cash: 100,
        food: 100,
        meal: 100,
      });

      accountRepository.findById.mockResolvedValue(account);

      await useCase.execute(transaction);
      const transactionParam =
        accountRepository.authorizeTransaction.mock.calls[0][2];
      expect(transactionParam.mcc).toBe(transaction.mcc);
    });

    it('should use mcc of merchant on transaction when merchant exist', async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction(null, '1111');
      const account = createAccount(transaction.account, {
        cash: 100,
        food: 100,
        meal: 100,
      });

      merchantRepository.findMCC.mockResolvedValue('3333');
      accountRepository.findById.mockResolvedValue(account);

      await useCase.execute(transaction);
      const transactionParam =
        accountRepository.authorizeTransaction.mock.calls[0][2];
      expect(transactionParam.mcc).toBe('3333');
    });

    it('should retry authorization when occurs error', async () => {
      const accountRepository = new MockAccountRepository();
      const merchantRepository = new MockMerchantRepository();

      const useCase = new AuthorizeTransactionUseCase(
        accountRepository,
        merchantRepository,
      );

      const transaction = createTransaction(null, '1111');
      const account = createAccount(transaction.account, {
        cash: 100,
        food: 100,
        meal: 100,
      });

      accountRepository.findById.mockResolvedValue(account);
      accountRepository.authorizeTransaction.mockRejectedValueOnce(
        new Error('error'),
      );
      accountRepository.authorizeTransaction.mockResolvedValueOnce(undefined);

      expect(await useCase.execute(transaction)).toEqual(
        new SuccessfulTransaction(),
      );
      expect(accountRepository.authorizeTransaction).toHaveBeenCalledTimes(2);
    });
  });
});
