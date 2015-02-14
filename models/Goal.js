// models/database.js
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Goal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    game_id: DataTypes.INTEGER,
    time: DataTypes.DATE,
    goal_player: DataTypes.INTEGER

  }, {
    indexes: [
        {
            name: "goalgame",
            fields: ['game_id']
        },
        {
            name: "goalplayer",
            fields: ['goal_player']
        }
    ]
  });
};