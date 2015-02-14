/**
 * add a goal to a currently running game
 */
exports.goalAdd = {
  name: 'goal/add',
  description: 'add a goal to a currently running game',
  inputs: {
    side: {
      required: true,
      validator: function(param) {
        if ( param == 1 || param == 2 ) {
            return true;
        }
        else {
            return new Error("side must be 1 or 2");
        }
      }
    }
  },
  outputExample:{
  },

  run: function(api, connection, next) {
  
    // check if a game is currently running
    api.models.Game
      .findOne({
        where: {
          end: {
            gte: new Date()
          }
        }
      })
      .then(gameValidation, responseError);


    function gameValidation (game) {
        if ( !game ) {
            return responseError("there is currently NO active game");
        }

		// add goal
		var start = new Date();
		var newGoal = {
			game_id: game.id,
			time: new Date(),
			goal_player: connection.params.side
		};

		api.models.Goal
		  .create(newGoal)
		  .then(responseSuccess, responseError)
		  ;
	}

    function responseSuccess(goal) {
        connection.response.goal = goal;
        next(connection, true);
    }

    function responseError(err) {
        api.log('Could not create new goal', 'error');
        connection.error = err;
        next(connection, true);
    }

  }
};




/**
 * list all goals for a single game
 */
exports.goalList = {
  name: 'goal/list',
  description: 'list all goals for a single game',
  inputs: {
    id: {
      required: true,
      validator: function(param) {
        if ( /[^0-9]/.test(param) ) {
          return new Error('id is not numeric');
        }
        else {
          return true;
        }
      }
    }  
  },
  outputExample:{
  },

  run: function(api, connection, next) {
  
    // check if a game is currently running
    api.models.Goal
      .findAll({
        where: {
          game_id: connection.params.id
        },
        order: "time"
      })
      .then(responseSuccess, responseError)
      .finally(function() {
        next(connection, true);
      });

    function responseSuccess(goals) {
        connection.response.goals = goals;
    }

    function responseError(err) {
        api.log('Could not read goals for ' + connection.params.id, 'error');
        connection.error = err;
    }

  }
};