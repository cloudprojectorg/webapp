//required files
require('dotenv').config({ path: '/etc/webapp.env' });
'use strict';
const { Submission } = require('../Models');
const {
  Model, DataTypes
} = require('sequelize');

//export module
module.exports = (sequelize) => {
  class Assignment extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Assignment.hasMany(models.Submission, { foreignKey: 'AssignmentId', as: 'submissions' });
    }
  }

  //initalise assignment
  Assignment.init({
    //assignment id
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    //assignment name
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //assignment points
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100
      }
    },
    //assignment num_of_attempts
    num_of_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100
      }
    },
    //assignment deadline
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    //assignment craeted at
    assignment_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    //assignment updated at
    assignment_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    //assignment user id
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id',    
      }
    }
  }, {
    //sequelize assignments
    sequelize,
    modelName: 'Assignment',
    tableName: 'Assignments',
    timestamps: false,
    hooks: {
      //before saving assignment
      beforeSave: (assignment, options) => {
        assignment.assignment_updated = new Date();
      }
    }
  });

  //return assignment
  return Assignment;
};
