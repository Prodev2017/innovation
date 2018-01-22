"use strict";

module.exports = function (sequelize, DataTypes) {
    var Invoice = sequelize.define("Invoice", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        number: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        purpose: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        supplier: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false
        },
        rate: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: false
        },
        date_paid: {
            type: DataTypes.DATE,
            allowNull: false
        },
        paystatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        }
    });

    Invoice.associate = function (models) {
      Invoice.hasMany(models.Payment, { foreignKey: 'invoice_id', as: 'Payments' });
    };



    return Invoice;
};
