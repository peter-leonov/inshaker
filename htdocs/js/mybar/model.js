;(function(){

var Papa = MyBar, Me = Papa.Model

var myProto =
{
	bind : function ()
	{
		this.view.renderCocktails(Cocktail.getAll().slice(50,55))
		this.view.renderIngredients(Ingredient.getAll().slice(50,55))
	}
}

Object.extend(Me.prototype, myProto)

})();