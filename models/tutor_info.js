'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tutor_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tutor_info.hasOne(models.User, { foreignKey: 'tutor_info_id', as: 'user' })
    }
  }
  Tutor_info.init({
    aboutMe: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    introduction: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    teachingStyle: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true
    },
    courseDuration: DataTypes.ENUM('30', '60'),
    days: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Tutor_info',
    tableName: 'Tutor_infos',
    underscored: true,
  });
  return Tutor_info;
};