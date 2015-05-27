/**
 * add a new player
 */
exports.playerAdd = {
  name: 'player/add',
  description: 'add a player',

  inputs: {
    name: {
      required: true,
      validator: function(param) {
        if ( /[^0-9 A-Z]/i.test(param) ) {
          return new Error('name is not alphanumeric');
        }
        else {
          return true;
        }
      }
    }
  },
  outputExample:
	{
	  "player": {
		"id": 12,
		"name": "a player",
		"updatedAt": "2015-02-14T14:39:10.000Z",
		"createdAt": "2015-02-14T14:39:10.000Z"
	  }
	}
  ,

  run: function(api, connection, next) {
    var newPlayer = {
      name: connection.params.name
    };

	api.models.Player
      .create(newPlayer)
      .then(responseSuccess, responseError)
      .finally(function() {
        next();
      });

    function responseSuccess(player) {
        connection.response.player = player;
    }

    function responseError(err) {
        api.log('Could not create new player ' + newPlayer.name, 'error');
        connection.error = err;
    }
  }
};


/**
 * read a player
 */
exports.playerRead = {
  name: 'player/read',
  description: 'read a player',

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
	  "player": {
		"id": 12,
		"name": "a player",
		"createdAt": "2015-02-14T14:39:10.000Z",
		"updatedAt": "2015-02-14T14:39:10.000Z"
	  }
	}
  ,

  run: function(api, connection, next) {
	api.models.Player
      .findOne(connection.params.id)
      .then(responseSuccess, responseError)
      .finally(function() {
        next();
      });

    function responseSuccess(player) {
        connection.response.player = player;
    }

    function responseError(err) {
        api.log('Could not create read player ' + connection.params.id, 'error');
        connection.error = err;
    }
  }
};


/**
 * remove a player
 */
exports.playerRemove = {
  name: 'player/remove',
  description: 'remove a player',

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
	  "player": {
		"id": 12,
		"name": "a player",
		"createdAt": "2015-02-14T14:39:10.000Z",
		"updatedAt": "2015-02-14T14:39:10.000Z"
	  }
	}
  ,

  run: function(api, connection, next) {
	api.models.Player
      .findOne(connection.params.id)
      .then(removePlayer, responseError)

    function removePlayer (player) {
        if ( !player ) {
            return responseError("player " + connection.params.id + " does not exist");
        }
        player.destroy()
          .then(function () {
            responseSuccess(player);
          }, responseError);
    }

    function responseSuccess(player) {
        connection.response.player = player;
        next();
    }

    function responseError(err) {
        api.log('Could not create remove player ' + connection.params.id, 'error');
        connection.error = err;
        next();
    }
  }
};


/**
 * list existing players
 */
exports.playerList = {
  name: 'player/list',
  description: 'list all players',

  outputExample:
	{
	  "players": [
		{
		  "id": 8,
		  "name": "test",
		  "createdAt": "2015-02-14T13:50:18.000Z",
		  "updatedAt": "2015-02-14T13:50:18.000Z"
		},
		{
		  "id": 9,
		  "name": "test",
		  "createdAt": "2015-02-14T13:54:11.000Z",
		  "updatedAt": "2015-02-14T13:54:11.000Z"
		}
	  ]
	}
  ,

  run: function(api, connection, next) {
	api.models.Player
      .findAll()
      .then(responseSuccess, responseError)
      .finally(function() {
        next();
      });

    function responseSuccess(rows) {
        connection.response.players = rows;
    }

    function responseError(err) {
        api.log('Could not read players', 'error');
        connection.error = err;
    }
  }
};