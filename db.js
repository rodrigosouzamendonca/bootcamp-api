const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

module.exports = app => {
  const config = app.libs.config;
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config.params
  );

  db = {
    sequelize,
    Sequelize,
    models: {}
  };

  const dir = path.join(__dirname, 'models');

  fs.readdirSync(dir).forEach(file => {
    const modelDir = path.join(dir, file);
    const model = sequelize.import(modelDir);
    db.models[model.name] = model;
  });

  Object.keys(db.models).forEach(key => {
    if (db.models[key].hasOwnProperty('associate')) {
      db.models[key].associate(db.models);
    }
  });

  return db;
};