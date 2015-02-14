/**
 * start a new game between two players
 * - validates the players participating
 * - and makes sure that there is always only one active game
 */
exports.gameStart = {
  name: 'game/start',
  description: 'start a new game between two players\
				- validates the players participating\
				- and makes sure that there is always only one active game\
			',

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
  outputExample:{
  },

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
        next(connection, true);
    }

    function responseError(err) {
        api.log('Could not create new game', 'error');
        connection.error = err;
        next(connection, true);
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
  outputExample:{
  },

  run: function(api, connection, next) {
	api.models.Game
      .findOne(connection.params.id)
      .then(responseSuccess, responseError)
      .finally(function() {
        next(connection, true);
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

  outputExample:{
  },

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
        next(connection, true);
    }

    function responseError(err) {
        api.log('Could not cancel a game', 'error');
        connection.error = err;
        next(connection, true);
    }
  }
};