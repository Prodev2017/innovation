"use strict";

module.exports = function (sequelize, DataTypes) {
    var Alert = sequelize.define("Alert", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        currency_src: {
            type: DataTypes.ENUM,
            values: ['EUR', 'USD'],
            allowNull: false
        },
        currency_dest: {
            type: DataTypes.ENUM,
            values: ['EUR', 'USD'],
            allowNull: false
        },
        rate_create: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        rate_ideal: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        rate_directional: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        rate_limit: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        date_expire: {
            type: DataTypes.DATE,
            allowNull: false
        },
        date_disable: {
            type: DataTypes.DATE,
            allowNull: true
        },
        invoice_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    Alert.associate = function (models) {
        Alert.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
    }

    return Alert;
};
