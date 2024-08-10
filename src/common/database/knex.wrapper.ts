import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class KnexWrapper {
  constructor(
    @Inject('KNEX_CLIENT')
    private readonly knex: Knex,
  ) {}

  getKnexClient() {
    return this.knex;
  }
}
