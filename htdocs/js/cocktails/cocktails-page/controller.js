;(function(){

function Me () {}

Me.prototype =
{
	hashUpdated: function (hash)
	{
		this.model.setState(hash)
	},
	
	addMoreCocktails: function ()
	{
		this.model.addMoreCocktails()
	},
	
	onNameFilter: function(name){
		this.model.setState(name);
	},
	
	onPageChanged: function(num){
		this.model.onPageChanged(num);
	}
}

Papa.Controller = Me

})();