module.exports = {
  database: 'bootcamp',
  username: '',
  password: '',
  params: {
    dialect: 'sqlite',
    logging: false,
    operatorsAliases: false,
    storage: 'bootcamp.sqlite',
    define: {
      underscored: true
    }
  },
  jwtSecret: 'BOO7C4MP-AP1',
  jwtSession: {
    session: false
  }
};