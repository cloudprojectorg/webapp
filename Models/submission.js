'use strict';
//required files
const { Model } = require('sequelize');

//export module
module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    static associate(models) {
      // Define association here
      Submission.belongsTo(models.Assignment, {
        foreignKey: 'AssignmentId',
        as: 'assignment'
      });
      Submission.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user'
      });
    }
  }
  
  //initialize submission
  Submission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    submission_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isUrl: true }
    },
    submission_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    AssignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Assignments',
        key: 'id',
      }
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      }
    }
  }, {
    sequelize,
    modelName: 'Submission',
    tableName: 'Submissions',
    timestamps: false,
  });

  //return submission
  return Submission;
};
