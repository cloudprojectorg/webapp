//required files
require('dotenv').config({ path: '/etc/webapp.env' });
'use strict';
const {
  Model, DataTypes
} = require('sequelize');

//expport module
module.exports = (sequelize) => {
  //extend model for user
  class User extends Model {
    static associate(models) {
      //one user with multiple assignments
      this.hasMany(models.Assignment, { foreignKey: 'userId', as: 'assignments' });
    }
  }

  //user initialize
  User.init({
    //user id
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    //user first name
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //user last name
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //user password
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //user email
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    //user account created
    account_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    //user account updated
    account_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: false,
    hooks: {
      beforeSave: (user, options) => {
        user.account_updated = new Date();
      }
    }
  });

  //return user
  return User;
};
