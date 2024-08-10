import { Module } from '@nestjs/common';
import knex from 'knex';
import { KnexWrapper } from './knex.wrapper';
import databaseConfig from './knexfile';

export const createKnex = (config) => {
  return () => knex(config);
};

@Module({
  providers: [
    {
      provide: 'KNEX_CLIENT',
      useFactory: createKnex(databaseConfig),
    },
    KnexWrapper,
  ],
  exports: [KnexWrapper],
})
export class DatabaseModule {}
