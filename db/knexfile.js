require('dotenv').config({ path: '../.env' });
// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: `${process.env.DB_HOST_TEST}`,
      database: `${process.env.DB_NAME_TEST}`,
      user: `${process.env.DB_USER_TEST}`,
      password: `${process.env.DB_PASSWORD_TEST}`,
    },
    pool: {
      min: 2,
      max: 10
    },
  },


  production: {
    client: 'postgresql',
    connection: {
      host: `${process.env.DB_HOST}`,
      database: `${process.env.DB_NAME}`,
      user: `${process.env.DB_USER}`,
      password: `${process.env.DB_PASSWORD}`,
    },
    pool: {
      min: 2,
      max: 10
    },
  }

};
