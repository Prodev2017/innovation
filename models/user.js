"use strict";
var crypto = require('crypto');
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM,
            values: ['Reader', 'Writer', 'Manager'],
            defaultValue: 'Reader'
        },
        lastread_activity_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['email']
                }
            ]
        }
    );

    User.hashPassword = function (password) {
        return crypto.createHash("sha256").update("" + password + "napalinnovation#2017", "utf8").digest("hex");
    }
    User.findByEmail = function (email, callback) {
        if (callback == null) {
            callback = function () { };
        }
        return User.findOne({
            where: {
                email: email
            }
        }).then(callback);
    }

    User.associate = function(models) {
      User.hasMany(models.Session, { foreignKey: 'user_id' });
      User.hasMany(models.Activity, { foreignKey: 'user_id' });
    };

    return User;
};
