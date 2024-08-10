import { KnexWrapper } from '@app/common/database/knex.wrapper';
import {
  AccountSchema,
  PGAccountRepository,
} from '@app/transaction/application/database/pg/pg-account.repository';
import { Account, AccountBalance } from '@app/transaction/domain/account';
import { Transaction } from '@app/transaction/domain/transaction';
import { TestBed } from '@automock/jest';
import { randomUUID } from 'crypto';

const createAccountDatabase = (
  account?: Account,
  newBalance?: AccountBalance,
): AccountSchema => ({
  id: account?.id || randomUUID(),
  ownerName: account?.ownerName || 'Henrique',
  cash: newBalance?.cash || account?.balance.cash || 100,
  food: newBalance?.food || account?.balance.food || 100,
  meal: newBalance?.food || account?.balance.meal || 100,
});

describe('PGAccountRepository', () => {
  const queryBuilderMockBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(undefined),
  });

  describe('findById', () => {
    it('should find account by id and return when account exists', async () => {
      const accountDatabase = createAccountDatabase();

      const queryBuilder = queryBuilderMockBuilder();
      queryBuilder.first.mockResolvedValue(accountDatabase);

      const { unit: repository } = TestBed.create(PGAccountRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const result = await repository.findById(accountDatabase.id);
      expect(result).toEqual(
        new Account(accountDatabase.id, accountDatabase.ownerName, {
          cash: accountDatabase.cash,
          food: accountDatabase.food,
          meal: accountDatabase.meal,
        }),
      );
    });

    it("should find account by id and return undefined when account doesn't exist", async () => {
      const queryBuilder = queryBuilderMockBuilder();

      const { unit: repository } = TestBed.create(PGAccountRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      expect(await repository.findById(randomUUID())).toBeUndefined();
    });

    it('should find account by id doing the right query', async () => {
      const queryBuilder = queryBuilderMockBuilder();

      const { unit: repository } = TestBed.create(PGAccountRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const id = randomUUID();
      await repository.findById(id);

      expect(queryBuilder.select).toHaveBeenCalledWith('*');
      expect(queryBuilder.where).toHaveBeenCalledWith({ id });
      expect(queryBuilder.from).toHaveBeenCalledWith('accounts');
      expect(queryBuilder.first).toHaveBeenCalled();
    });
  });

  describe('authorizeTransaction', () => {
    const queryBuilderMockBuilder = () => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      forUpdate: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      insert: jest.fn().mockResolvedValue(undefined),
      transaction: jest.fn().mockReturnThis(),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    });

    const createAccountEntity = () =>
      new Account(randomUUID(), 'Henrique', {
        cash: 100,
        food: 100,
        meal: 100,
      });

    const createTransaction = (account: Account) =>
      new Transaction(randomUUID(), account.id, 50, 'Padaria X', '111');

    it('should updates account balance and creates transaction when account balance has consistent data', async () => {
      const queryBuilder = queryBuilderMockBuilder();
      const { unit: repository } = TestBed.create(PGAccountRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const account = createAccountEntity();
      const databaseAccount = createAccountDatabase(account);
      const transaction = createTransaction(account);

      const newBalance: AccountBalance = {
        cash: account.balance.cash - transaction.amount,
        food: 100,
        meal: 100,
      };

      queryBuilder.first.mockResolvedValue(databaseAccount);

      await expect(
        repository.authorizeTransaction(account, newBalance, transaction),
      ).resolves.toBeUndefined();
      expect(queryBuilder.transaction).toHaveBeenCalledTimes(1);
      expect(queryBuilder.forUpdate).toHaveBeenCalledTimes(1);
      expect(queryBuilder.commit).toHaveBeenCalledTimes(1);
    });

    it('should throws error when account balance has inconsistent data', async () => {
      const queryBuilder = queryBuilderMockBuilder();
      const { unit: repository } = TestBed.create(PGAccountRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const account = createAccountEntity();
      const databaseAccount = createAccountDatabase(account, {
        cash: 20,
        food: 100,
        meal: 100,
      });
      const transaction = createTransaction(account);

      const newBalance: AccountBalance = {
        cash: account.balance.cash - transaction.amount,
        food: 100,
        meal: 100,
      };

      queryBuilder.first.mockResolvedValue(databaseAccount);

      await expect(
        repository.authorizeTransaction(account, newBalance, transaction),
      ).rejects.toThrow(new Error('Transaction conflicting'));
      expect(queryBuilder.transaction).toHaveBeenCalledTimes(1);
      expect(queryBuilder.forUpdate).toHaveBeenCalledTimes(1);
      expect(queryBuilder.rollback).toHaveBeenCalledTimes(1);
    });

    it('should authorize transaction with right query params', async () => {
      const queryBuilder = queryBuilderMockBuilder();
      const { unit: repository } = TestBed.create(PGAccountRepository)
        .mock(KnexWrapper)
        .using({
          getKnexClient: () => queryBuilder,
        })
        .compile();

      const account = createAccountEntity();
      const databaseAccount = createAccountDatabase(account);
      const transaction = createTransaction(account);

      const newBalance: AccountBalance = {
        cash: account.balance.cash - transaction.amount,
        food: 100,
        meal: 100,
      };

      queryBuilder.first.mockResolvedValue(databaseAccount);

      await repository.authorizeTransaction(account, newBalance, transaction);

      expect(queryBuilder.select).toHaveBeenCalledTimes(1);
      expect(queryBuilder.where).toHaveBeenNthCalledWith(1, { id: account.id });
      expect(queryBuilder.from).toHaveBeenCalledWith('accounts');
      expect(queryBuilder.forUpdate).toHaveBeenCalledTimes(1);
      expect(queryBuilder.first).toHaveBeenCalledTimes(1);

      expect(queryBuilder.where).toHaveBeenNthCalledWith(2, { id: account.id });
      expect(queryBuilder.from).toHaveBeenCalledWith('accounts');
      expect(queryBuilder.update).toHaveBeenCalledWith(newBalance);

      expect(queryBuilder.into).toHaveBeenCalledWith('transactions');
      expect(queryBuilder.insert).toHaveBeenCalledWith(transaction);
    });
  });
});
