import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('accounts').del();

  // Inserts seed entries
  await knex('accounts').insert([
    {
      id: '62087759308',
      ownerName: 'Bianca Rebeca Eliane Oliveira',
      cash: 1000,
      food: 1000,
      meal: 1000,
    },
    {
      id: '69698308105',
      ownerName: 'Benício Vicente Baptista',
      cash: 1000,
      food: 1000,
      meal: 1000,
    },
    {
      id: '91952673798',
      ownerName: 'Renata Daiane Alícia Castro',
      cash: 1000,
      food: 1000,
      meal: 1000,
    },
  ]);
}
