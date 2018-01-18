"use strict";

module.exports = function (sequelize, DataTypes) {
    var Activity = sequelize.define("Activity", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        time_performed: {
            type: DataTypes.DATE,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        detail: {
            type: DataTypes.TEXT,
            allowNull: false
        }      

    });

    Activity.associate = function(models) {
        Activity.belongsTo(models.User, { foreignKey: 'user_id' });
      };
    return Activity;
};
