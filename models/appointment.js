'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Appointment.init({
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tutorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('booked', 'completed'),
      defaultValue: 'booked',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'Appointments',
    underscored: true
  })
  return Appointment
}