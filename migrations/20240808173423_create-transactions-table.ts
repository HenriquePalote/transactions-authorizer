import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('id').unique().primary();
    table.string('account');
    table.string('merchant');
    table.string('mcc');
    table.float('amount');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions');
}
