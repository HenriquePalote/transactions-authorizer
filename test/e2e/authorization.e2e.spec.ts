import { AppModule } from '@app/app.module';
import { KnexWrapper } from '@app/common/database/knex.wrapper';
import { Test, TestingModule } from '@nestjs/testing';
import knex from 'knex';
import e2eDatabaseConfig from './e2e-knexfile';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';
import async from 'async';

describe('Transaction authorization E2E test', () => {
  let module: TestingModule;
  let app: INestApplication;
  let agent;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('KNEX_CLIENT')
      .useFactory({
        factory: () => {
          return knex(e2eDatabaseConfig);
        },
      })
      .compile();

    const knexClient = (await module.resolve(KnexWrapper)).getKnexClient();
    await knexClient.migrate.rollback(undefined, true);
    await knexClient.migrate.latest();
    await knexClient.seed.run();

    app = module.createNestApplication();
    await app.init();

    agent = request(app.getHttpServer());
  });

  it('Should concurrently authorize transactions of same account and type', async () => {
    const accountId = '69698308105';
    const mcc = '5812';

    const asyncTask = async () => {
      return await agent.post('/transactions/authorize').send({
        id: randomUUID(),
        account: accountId,
        amount: 100,
        mcc: mcc,
        merchant: 'Telecom ME',
      });
    };

    const responses = await async.parallel([asyncTask, asyncTask, asyncTask]);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ code: '00' });
    });

    const knexClient = (await module.resolve(KnexWrapper)).getKnexClient();

    const result = await knexClient
      .select('*')
      .where({ id: accountId })
      .from('accounts')
      .first();
    expect(result.food).toBe(700);
  });

  it('Should concurrently authorize transactions of same account and type, using cash fallback', async () => {
    const accountId = '69698308105';
    const mcc = '5812';

    const asyncTask = async () => {
      return await agent.post('/transactions/authorize').send({
        id: randomUUID(),
        account: accountId,
        amount: 700,
        mcc: mcc,
        merchant: 'Telecom ME',
      });
    };

    const responses = await async.parallel([asyncTask, asyncTask]);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ code: '00' });
    });

    const knexClient = (await module.resolve(KnexWrapper)).getKnexClient();

    const result = await knexClient
      .select('*')
      .where({ id: accountId })
      .from('accounts')
      .first();
    expect(result.food).toBe(0);
    expect(result.cash).toBe(600);
  });

  it('Should concurrently authorize transactions of same account and different types', async () => {
    const accountId = '69698308105';

    const asyncTask = (mcc) => async () => {
      return await agent.post('/transactions/authorize').send({
        id: randomUUID(),
        account: accountId,
        amount: 900,
        mcc: mcc,
        merchant: 'Unregistered merchant',
      });
    };

    const responses = await async.parallel([
      asyncTask('5812'),
      asyncTask('5411'),
    ]);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ code: '00' });
    });

    const knexClient = (await module.resolve(KnexWrapper)).getKnexClient();

    const result = await knexClient
      .select('*')
      .where({ id: accountId })
      .from('accounts')
      .first();
    expect(result.food).toBe(100);
    expect(result.meal).toBe(100);
  });

  it('Should concurrently authorize transactions of different accounts', async () => {
    const accountIdList = ['69698308105', '91952673798'];

    const asyncTask = (accountId) => async () => {
      return await agent.post('/transactions/authorize').send({
        id: randomUUID(),
        account: accountId,
        amount: 900,
        mcc: '1234',
        merchant: 'Unregistered merchant',
      });
    };

    const responses = await async.parallel([
      asyncTask(accountIdList[0]),
      asyncTask(accountIdList[1]),
    ]);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ code: '00' });
    });

    const knexClient = (await module.resolve(KnexWrapper)).getKnexClient();

    const result = await knexClient
      .select('*')
      .where({ id: accountIdList[0] })
      .orWhere({ id: accountIdList[1] })
      .from('accounts');
    await result.forEach((account) => expect(account.cash).toBe(100));
  });

  it("Should concurrently process transactions when balance it's sufficient for just one", async () => {
    const accountId = '69698308105';

    const asyncTask = async () => {
      return await agent.post('/transactions/authorize').send({
        id: randomUUID(),
        account: accountId,
        amount: 900,
        mcc: '1234',
        merchant: 'Unregistered merchant',
      });
    };

    const responses = await async.parallel([asyncTask, asyncTask]);

    expect(responses[0].statusCode).toBe(200);
    expect(responses[0].body).toEqual({ code: '00' });

    expect(responses[1].statusCode).toBe(200);
    expect(responses[1].body).toEqual({ code: '51' });

    const knexClient = (await module.resolve(KnexWrapper)).getKnexClient();

    const result = await knexClient
      .select('*')
      .where({ id: accountId })
      .from('accounts')
      .first();
    expect(result.cash).toBe(100);
  });

  it("Should result with error code when account doesn't exist", async () => {
    const accountId = '11111111';

    const response = await agent.post('/transactions/authorize').send({
      id: randomUUID(),
      account: accountId,
      amount: 900,
      mcc: '1234',
      merchant: 'Unregistered merchant',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ code: '07' });
  });

  afterEach(async () => {
    await app.close();
    const knex = (await module.resolve(KnexWrapper)).getKnexClient();
    await knex.destroy();
    await module.close();
  });
});
