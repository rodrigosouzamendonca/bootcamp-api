const bcrypt = require('bcrypt-nodejs');

module.exports = (sequelize, DataType) => {
  const Users = sequelize.define('Users', {
    id: {
      type: DataType.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataType.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataType.STRING(12),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 12]
      }
    }
  });

  Users.associate = models => {
    Users.hasMany(models.Tasks, {
      onDelete: 'CASCADE'
    });
  };

  Users.hook('beforeCreate', user => {
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);
  });

  Users.isPassword = (encodedPassword, password) => {
    return bcrypt.compareSync(password, encodedPassword);
  };

  return Users;
};