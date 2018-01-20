"use strict";

module.exports = function (sequelize, DataTypes) {
    var Payment = sequelize.define("Payment", {
        order: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        invoice_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        type: {
          type: DataTypes.ENUM,
          values: ['Spot', 'Contract'],
          defaultValue: 'Spot'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        rate: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        contract_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },
    {
      timestamps: false
    });

    Payment.associate = function (models) {
        Payment.belongsTo(models.Invoice, { foreignKey: 'invoice_id' });
        Payment.belongsTo(models.Contract, { foreignKey: 'contract_id' });
    };

    return Payment;
};
