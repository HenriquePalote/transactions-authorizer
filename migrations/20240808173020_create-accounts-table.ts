import { BalanceType } from '@app/transaction/domain/account';
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('accounts', (table) => {
    table.string('id').unique().primary();
    table.string('ownerName');
    table.float(BalanceType.FOOD);
    table.float(BalanceType.CASH);
    table.float(BalanceType.MEAL);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('accounts');
}
