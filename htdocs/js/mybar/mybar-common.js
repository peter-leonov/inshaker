<!--# include virtual="/liby/modules/json.js" -->
<!--# include virtual="/liby/modules/client-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/local-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/global-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/user-data.js" -->
<!--# include virtual="/liby/modules/client-storage/flash-9.js" -->

var clientStorage = ClientStorage.guess()
if (!clientStorage)
{
  window.setTimeout(function () { throw new Error('no client storge was found') }, 0)
  clientStorage =
  {
    hash: {},
    ready: function (f) { window.setTimeout(f, 0) },
    set: function (k, v) { return this.hash[k] = v },
    get: function (k) { return this.hash[k] },
    remove: function (k) { delete this.hash[k] }
  }
}

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
