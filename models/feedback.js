'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Feedback.belongsTo(models.Appointment, {
        foreignKey: 'appointment_id',
        as: 'appointmentInfo'
      })
    }
  }
  Feedback.init({
    appointmentId: DataTypes.INTEGER,
    rating: DataTypes.FLOAT,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'Feedbacks',
    underscored: true,
  });
  return Feedback;
};