const databaseConfig = {
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'pg-local-user',
    password: 'pg-local-password',
    database: 'postgres',
  },
  migrations: {
    directory: '../../../migrations',
    extension: 'ts',
  },
  seeds: {
    directory: '../../../seeds',
  },
};

export default databaseConfig;
