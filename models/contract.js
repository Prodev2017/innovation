"use strict";

module.exports = function (sequelize, DataTypes) {
    var Contract = sequelize.define("Contract", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        currency_src: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        currency_dest: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        rate: {
            type: DataTypes.DECIMAL(10, 4),
            allowNull: true
        },
        date_buy: {
            type: DataTypes.DATE,
            allowNull: false
        },
        date_open: {
            type: DataTypes.DATE,
            allowNull: false
        },
        date_close: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });


    return Contract;
};
