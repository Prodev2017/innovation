"use strict";

module.exports = function (sequelize, DataTypes) {
    var Session = sequelize.define("Session", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        time_active: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        }
    },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['id']
                }
            ]
        });

    Session.associate = function (models) {
        Session.belongsTo(models.User, { foreignKey: 'user_id' });
    }

    return Session;
};
