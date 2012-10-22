<!--# include virtual="/liby/modules/json.js" -->
<!--# include virtual="/liby/modules/client-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/local-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/global-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/user-data.js" -->
<!--# include virtual="/liby/modules/client-storage/flash-9.js" -->

var clientStorage = ClientStorage.guess()
if (!clientStorage)
	throw new Error('no client storge was found')

<!--# include virtual="bar-storage.js" -->

<!--# include virtual="mvc.js" -->

Ingredient.calculateTheCocktailsPropertyForEachIngredient = function ()
{
	if (this._calculateTheCocktailsPropertyForEachIngredient)
		return
	this._calculateTheCocktailsPropertyForEachIngredient = true
	
	var db = this.db
	for (var i = 0, il = db.length; i < il; i++)
	{
		var ingred = db[i]
		ingred.cocktails = Cocktail.getByIngredient(ingred.name)
	}
}
