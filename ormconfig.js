module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'MANGAHAY',
  entities: ['dist/**/*.entity.ts'],
  synchronize: false,
  migrations: ['dist/common/migrations/*.js'],
  cli: {
    migrationsDir: 'src/common/migrations',
  },
};
