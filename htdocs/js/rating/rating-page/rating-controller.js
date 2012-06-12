;(function(){

function Me () {}

Me.prototype =
{
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	},
	
	changeHashReaction: function(hash)
	{
		this.model.setState(hash)
	}
}

Papa.Controller = Me

})();