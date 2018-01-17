"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      /* Modifications for Contracts table */
      queryInterface.removeIndex('Contracts', 'user_id'),
      queryInterface.removeColumn('Contracts', 'user_id'),

      /* Modifications for Alerts table */
      queryInterface.renameColumn('Alerts', 'user_id', 'invoice_id'),

      /* Modifications for Users table */
      queryInterface.addColumn('Users', 'lastread_activity_id', {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true
      })
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [
      /* Modifications for Contracts table */
      queryInterface.addColumn('Contracts', 'user_id', {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false
      }),
      queryInterface.addIndex('Contracts', {
        fields: ['user_id'],
        name: 'user_id'
      }),

      /* Modifications for Alerts table */
      queryInterface.renameColumn('Alerts', 'invoice_id', 'user_id'),

      /* Modifications for Users table */
      queryInterface.removeColumn('Users', 'lastread_activity_id')
    ];
  }
}
