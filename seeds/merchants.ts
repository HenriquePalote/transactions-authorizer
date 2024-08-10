import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('merchants').del();

  // Inserts seed entries
  await knex('merchants').insert([
    {
      identifier: 'MICBL',
      name: 'Matheus e Isaac Comercio de Bebidas Ltda',
      mcc: '5411',
    },
    {
      identifier: 'Telecom ME',
      name: 'Amanda e Daiane Telecom ME',
      mcc: '5412',
    },
    {
      identifier: 'Pizzaria 65649246000134',
      name: 'Márcio e Lúcia Pizzaria Ltda',
      mcc: '5811',
    },
    {
      identifier: 'SSF BH',
      name: 'Sabrina e Stella Filmagens ME',
      mcc: '5812',
    },
    {
      identifier: 'Assessoria Jurídica LeV',
      name: 'Louise e Vitor Assessoria Jurídica Ltda',
      mcc: '5546',
    },
    {
      identifier: 'RESTAURANTE SSSS',
      name: 'Severino e José Restaurante Ltda',
      mcc: '5550',
    },
  ]);
}
