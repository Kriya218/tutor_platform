'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Tutor_info, { foreignKey: 'tutor_info_id', as: 'tutorInfo' })
      User.belongsToMany(User, {
        through: models.Appointment,
        foreignKey: 'tutorId',
        as: 'tutor'
      })
      User.belongsToMany(User, {
        through: models.Appointment,
        foreignKey: 'studentId',
        as: 'student'
      })
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'student', 'tutor'),
      defaultValue: 'student',
      allowNull: false
    },
    tutorInfoId: DataTypes.INTEGER,
    aboutMe: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true,
  });
  return User;
};