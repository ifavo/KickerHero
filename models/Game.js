// models/database.js
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    player1: DataTypes.INTEGER,
    player2: DataTypes.INTEGER,
    goals1: DataTypes.INTEGER,
    goals2: DataTypes.INTEGER

  }, {
    indexes: [
        {
            name: "gameplayer1",
            fields: ['player1']
        },
        {
            name: "gameplayer2",
            fields: ['player2']
        },
        {
            name: "gametime",
            fields: ['start']
        }
    ]
  });
};