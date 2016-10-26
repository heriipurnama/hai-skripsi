
module.exports = function(options){
	var seneca = this
	var mongoose = require ('mongoose')
	var plugin = 'db'

	seneca.add({role:plugin, cmd:'db1'}, cmd_db1)

	function cmd_db1(save, done){
		 var apple = seneca.make$('fruity');
  		apple.name  = 'Pink Lady';
  		apple.price = 1.99;
  		apple.save$(function(err,apple){
    	if( err ) return console.log(err);
    	
	})
	return{name:plugin};
}
}