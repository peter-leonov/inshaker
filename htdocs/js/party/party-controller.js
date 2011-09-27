;(function(){

function Me () {}

Me.prototype =
{
	partyNameGuessed: function (name)
	{
		this.model.setPartyName(name)
	},
	
	peopleCountChanged: function (v)
	{
		this.model.setPeopleCount(v)
	},
	
	cocktailCountChanged: function (n, v)
	{
		this.model.setCocktailCount(n, v)
	},
	
	ingredientSelected: function (name)
	{
		this.model.selectIngredientName(name)
	}
}

Papa.Controller = Me

})();
