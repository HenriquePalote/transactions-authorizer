import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('merchants', (table) => {
    table.string('identifier').unique().primary();
    table.string('name');
    table.string('mcc');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('merchants');
}
