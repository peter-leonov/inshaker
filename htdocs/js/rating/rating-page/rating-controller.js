;(function(){

function Me () {}

Me.prototype =
{
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	}
}

Papa.Controller = Me

})();