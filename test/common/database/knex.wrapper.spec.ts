import { KnexWrapper } from '@app/common/database/knex.wrapper';
import { Knex } from 'knex';

describe('KnexWrapper', () => {
  it('should return knex instance', () => {
    const knex = {} as Knex;
    const knexWrapper = new KnexWrapper(knex);
    expect(knexWrapper.getKnexClient()).toBe(knex);
  });
});
