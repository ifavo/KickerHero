exports.showDocumentation = {
  name: 'game/start',
  description: 'start a new game',

  outputExample:{
  },

  run: function(api, connection, next){    
    
    connection.response.documentation = api.documentation.documentation;
    next(connection, true);
  }
};