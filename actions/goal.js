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
  outputExample:
	{
	  "goal": {
		"id": 2,
		"game_id": 15,
		"time": "2015-02-14T14:29:08.051Z",
		"goal_player": "1",
		"updatedAt": "2015-02-14T14:29:08.000Z",
		"createdAt": "2015-02-14T14:29:08.000Z"
	  }
	}
  ,

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
  outputExample:
	{
	  "goals": [
		{
		  "id": 6,
		  "game_id": 19,
		  "time": "2015-02-14T14:43:08.113Z",
		  "goal_player": 2,
		  "createdAt": "2015-02-14T14:43:08.000Z",
		  "updatedAt": "2015-02-14T14:43:08.000Z"
		},
		{
		  "id": 7,
		  "game_id": 19,
		  "time": "2015-02-14T14:43:26.922Z",
		  "goal_player": 2,
		  "createdAt": "2015-02-14T14:43:26.000Z",
		  "updatedAt": "2015-02-14T14:43:26.000Z"
		},
		{
		  "id": 8,
		  "game_id": 19,
		  "time": "2015-02-14T14:43:36.793Z",
		  "goal_player": 1,
		  "createdAt": "2015-02-14T14:43:36.000Z",
		  "updatedAt": "2015-02-14T14:43:36.000Z"
		}
	  ]
    }
  ,

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