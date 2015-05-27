var kickerApp = angular.module('Kicker', []);

kickerApp.controller('DisplayCtrl', ['$scope', '$interval', function ($scope, $interval) {

  // init our actionhero client
  var client = new ActionheroClient();
  $scope.playerById = {};

  /**
   * start a new game
   */
  $scope.startGame = function () {
    client.action('game/start', {player1: $scope.player1.id, player2: $scope.player2.id}, function(data){
      if ( data.error ) {
        return alert(data.error);
      }
    });
  };


  /**
   * cancel an active game
   */
  $scope.cancelGame = function () {
    client.action('game/cancel', {player1: $scope.player1.id, player2: $scope.player2.id}, function(data){
    });
  };


  /**
   * listen for goal changes of player1
   * @param {Number} newVal new goal value
   * @param {Number} oldVal previous goal value
   */
  $scope.$watch("activeGame.goals1", function (newVal, oldVal) {
    if ( newVal > oldVal ) {
      console.log($scope.player1, "shot a goal");
    }
  });

  /**
   * listen for goal changes of player2
   * @param {Number} newVal new goal value
   * @param {Number} oldVal previous goal value
   */
  $scope.$watch("activeGame.goals2", function (newVal, oldVal) {
    if ( newVal > oldVal ) {
      console.log($scope.player2, "shot a goal");
    }
  });

  /**
   * called in the end to display the final results
   * access game data in $scope.activeGame
   */
  function gameEnd() {
    // update the last played games
    updateHistory();
  }

  /**
   * called regularly to update the countdown and current game status
   */
  function countdown () {
    client.action('game/current', function(data){

      // reset activeGame on errors
      if ( !data || !data.game ) {

        // if there was an active game, mark this as the result
        if ( $scope.activeGame ) {
          gameEnd();
        }
        $scope.activeGame = null;
        return;
      }

      // if this reads the first response of an active game, set the players
      if ( !$scope.activeGame ) {
		  angular.forEach($scope.players, function (v, k) {
			if ( v.id == data.game.player1 ) {
			  $scope.player1 = v;
			}
			else if ( v.id == data.game.player2 ) {
			  $scope.player2 = v;
			}
		  });
	  }


      // update goal listing when results change
      if ( !$scope.lastGame || data.game.goals1 != $scope.lastGame.goals1 || data.game.goals2 != $scope.lastGame.goals2 ) {
        client.action('goal/list', {id: data.game.id}, function(data) {
          if ( data && data.goals ) {
            $scope.goals = data.goals;
          }
        });
      }

      $scope.lastGame = $scope.activeGame = data.game;
      $scope.countdown = data.countdown;
    });
  }


  /**
   * fetch the latest games
   */
  function updateHistory () {
    client.action('game/list', {order: "start desc", limit: 10}, function (data) {
      $scope.history = data.games;
    });
  }

  /**
   * helper function to format countdown numbers
   * @param {Number} n
   * @return {String}
   */
  $scope.z = function (n) {
    return (n<10? '0' : '') + Math.floor(n);
  };

  /**
   * fetch some data and start the interval when the document is ready
   */
  angular.element(document).ready(function () {
    client.connect(function(err, details){
      if ( !err ) {
        /**
         * fetch the available player list
         */
        client.roomAdd("defaultRoom");
        client.action('player/list', function (data) {
          $scope.$apply(function () {
            $scope.players = data.players;

            angular.forEach(data.players, function (v, k) {
              $scope.playerById[v.id] = v;
            });

            // update last played games
            updateHistory();

          });
        });

        // countdown interval
        $interval(countdown, 1000);
      }
    });
  });

}]);