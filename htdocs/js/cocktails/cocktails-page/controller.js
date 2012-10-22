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
	}
}

Papa.Controller = Me

})();