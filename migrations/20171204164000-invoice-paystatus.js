"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      /* Modifications for Invoices table */
      queryInterface.addColumn('Invoices', 'paystatus', {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0
      })
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [
      /* Modifications for Invoices table */
      queryInterface.removeColumn('Invoices', 'paystatus')
    ];
  }
}
