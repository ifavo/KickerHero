// models/database.js
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING

  });
};