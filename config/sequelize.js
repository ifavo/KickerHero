exports.default = { 
  sequelize: function(api){
    return {
      "storage"     : __dirname + '/../db/dev.db',
      "dialect"     : "sqlite"
    }
  }
}


exports.test = { 
  sequelize: function(api){
    return {
      "logging"     : false,
      "storage"     : __dirname + '/../db/test.db',
      "dialect"     : "sqlite"
    }
  }
}

exports.production = { 
  sequelize: function(api){
    return {
      "storage"     : __dirname + '/../db/production.db',
      "dialect"     : "sqlite"
    }
  }
}