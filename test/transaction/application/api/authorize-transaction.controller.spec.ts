import { AuthorizeTransactionController } from '@app/transaction/application/api/authorize-transaction.controller';
import { TransactionRequest } from '@app/transaction/application/api/request/transaction.request';
import {
  ErrorTransaction,
  SuccessfulTransaction,
} from '@app/transaction/domain/authorization-results';
import { MCCValues } from '@app/transaction/domain/transaction';
import { AuthorizeTransactionUseCase } from '@app/transaction/domain/use-case/authorize-transaction.use-case';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { TestBed } from '@automock/jest';

describe('AuthorizeTransactionController', () => {
  it('should execute use case and return result code', async () => {
    const request: TransactionRequest = {
      account: randomUUID(),
      amount: faker.number.float({
        min: 100,
        max: 200,
      }),
      mcc: faker.helpers.arrayElement(MCCValues),
      merchant: faker.company.name(),
      id: randomUUID(),
    };

    const { unit: controller, unitRef } = TestBed.create(
      AuthorizeTransactionController,
    ).compile();
    const useCase = unitRef.get(AuthorizeTransactionUseCase);
    useCase.execute.mockResolvedValue(new SuccessfulTransaction());

    const response = await controller.authorize(request);
    expect(response).toEqual(new SuccessfulTransaction());
  });

  it('should return error transaction if request is invalid', async () => {
    const { unit: controller } = TestBed.create(
      AuthorizeTransactionController,
    ).compile();

    const response = await controller.authorize({});
    expect(response).toEqual(new ErrorTransaction());
  });
});
