/**
 * start a new game between two players
 * - validates the players participating
 * - and makes sure that there is always only one active game
 */
exports.gameStart = {
  name: 'game/start',
  description: 'start a new game between two players (validates the players participating & and makes sure that there is always only one active game)',

  inputs: {
    player1: {
      required: true,
      validator: function(param) {
        if ( /[^0-9]/.test(param) ) {
          return new Error('player1 is not numeric');
        }
        else {
          return true;
        }
      }
    },
    player2: {
      required: true,
      validator: function(param) {
        if ( /[^0-9]/.test(param) ) {
          return new Error('player2 is not numeric');
        }
        else {
          return true;
        }
      }
    }
  },
  outputExample:
	{
	  "players": [
		{
		  "id": 14,
		  "name": "first player",
		  "createdAt": "2015-02-14T14:41:18.000Z",
		  "updatedAt": "2015-02-14T14:41:18.000Z"
		},
		{
		  "id": 15,
		  "name": "second player",
		  "createdAt": "2015-02-14T14:41:20.000Z",
		  "updatedAt": "2015-02-14T14:41:20.000Z"
		}
	  ],
	  "game": {
		"id": 18,
		"player1": "14",
		"player2": "15",
		"goals1": "0",
		"goals2": "1",
		"start": "2015-02-14T14:41:56.745Z",
		"end": "2015-02-14T14:46:56.745Z",
		"updatedAt": "2015-02-14T14:41:56.000Z",
		"createdAt": "2015-02-14T14:41:56.000Z"
	  }
	}
   ,

  run: function(api, connection, next) {

    // check if a game is already running
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
        if ( game ) {
            return responseError("a game is already active");
        }
        validatePlayer();
    }


    function validatePlayer () {

		// validate both participating players
		api.models.Player
		  .findAll({
			  where: {
				  id: {
					  in: [connection.params.player1, connection.params.player2]
				  }
			  }
		  })
		  .then(playerValidation, responseError)
		  ;
	}

    function playerValidation (players) {
        if ( players.length == 2 ) {
            connection.response.players = players;
            gameAdd();
        }
        else {
            return responseError("at least one player was invalid");
        }
    }

    function gameAdd () {

		// create game
		var start = new Date();
		var newGame = {
			player1: connection.params.player1,
			player2: connection.params.player2,
			goals1: 0,
			goals2: 0,
			start: start,
			end: new Date(start.getTime() + 5*60*1000)
		};

		api.models.Game
		  .create(newGame)
		  .then(responseSuccess, responseError)
		  ;
	}

    function responseSuccess(game) {
        connection.response.game = game;
        next();
    }

    function responseError(err) {
        api.log('Could not create new game', 'error');
        connection.error = err;
        next();
    }

  }
};


/**
 * read game data
 */
exports.gameRead = {
  name: 'game/read',
  description: 'read game data',

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
	  "game": {
		"id": 18,
		"start": "2015-02-14T14:41:56.745Z",
		"end": "2015-02-14T14:46:56.745Z",
		"player1": 14,
		"player2": 15,
		"goals1": "0",
		"goals2": "1",
		"createdAt": "2015-02-14T14:41:56.000Z",
		"updatedAt": "2015-02-14T14:41:56.000Z"
	  }
	}
  ,

  run: function(api, connection, next) {
	api.models.Game
      .findOne(connection.params.id)
      .then(responseSuccess, responseError)
      .finally(function() {
        next();
      });

    function responseSuccess(game) {
        connection.response.game = game;
    }

    function responseError(err) {
        api.log('Could not create read game ' + connection.params.id, 'error');
        connection.error = err;
    }
  }
};



/**
 * cancel a currently running game by setting the end time to now
 */
exports.gameCancel = {
  name: 'game/cancel',
  description: 'cancel a currently running game by setting the end time to now',

  outputExample:
	{
	  "game": {
		"id": 18,
		"start": "2015-02-14T14:41:56.745Z",
		"end": "2015-02-14T14:42:31.603Z",
		"player1": 14,
		"player2": 15,
		"goals1": "0",
		"goals2": "1",
		"createdAt": "2015-02-14T14:41:56.000Z",
		"updatedAt": "2015-02-14T14:42:31.000Z"
	  }
	}
  ,

  run: function(api, connection, next) {

    // check if a game is already running
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
          return responseError("could not find an active game");
        }

        game.end = new Date();
        game.save()
          .then(responseSuccess, responseError);
    }

    function responseSuccess(game) {
        connection.response.game = game;
        next();
    }

    function responseError(err) {
        api.log('Could not cancel a game', 'error');
        connection.error = err;
        next();
    }
  }
};



/**
 * list old games
 */
exports.gameList = {
  name: 'game/list',
  description: 'list old games',

  inputs: {
    order: {},
    limit: {},
    offset: {}
  },
  outputExample:
	{
	  "games": [
		{
		  "id": 1,
		  "start": null,
		  "end": "2015-02-14T14:21:45.325Z",
		  "player1": null,
		  "player2": null,
		  "goals1": "0",
		  "goals2": "1",
		  "createdAt": "2015-02-14T14:07:47.000Z",
		  "updatedAt": "2015-02-14T14:21:45.000Z"
		},
		{
		  "id": 2,
		  "start": null,
		  "end": "2015-02-14T14:21:47.756Z",
		  "player1": 1,
		  "player2": 2,
		  "goals1": "0",
		  "goals2": "1",
		  "createdAt": "2015-02-14T14:08:16.000Z",
		  "updatedAt": "2015-02-14T14:21:47.000Z"
		}
	  ]
	}
  ,

  run: function(api, connection, next) {
	api.models.Game
      .findAll({
        where: {
          end: {
            lte: new Date()
          }
        },
        order: connection.params.order || "id",
        limit: connection.params.limit || 100,
        offset: connection.params.offset || 0
      })
      .then(responseSuccess, responseError)
      .finally(function() {
        next();
      });

    function responseSuccess(rows) {
        connection.response.games = rows;
    }

    function responseError(err) {
        api.log('Could not read games', 'error');
        connection.error = err;
    }
  }
};



/**
 * get currently active game
 */
exports.gameCurrent = {
  name: 'game/current',
  description: 'get currently active game',

  outputExample:
	{
	  "game": {
		"id": 18,
		"start": "2015-02-14T14:41:56.745Z",
		"end": "2015-02-14T14:46:56.745Z",
		"player1": 14,
		"player2": 15,
		"goals1": "0",
		"goals2": "1",
		"createdAt": "2015-02-14T14:41:56.000Z",
		"updatedAt": "2015-02-14T14:41:56.000Z"
	  }
	}
  ,

  run: function(api, connection, next) {
	api.models.Game
      .findOne({
        where: {
          end: {
            gte: new Date()
          }
        }
      })
      .then(responseSuccess, responseError)
      .finally(function() {
        next();
      });

    function responseSuccess(game) {
        // calculate seconds left to play and add to output
        connection.response.countdown = (game && game.end) ? Math.floor((new Date(game.end) - new Date())/1000) : 0;
        connection.response.game = game;
    }

    function responseError(err) {
        api.log('Could not find an active game', 'error');
        connection.error = err;
    }
  }
};