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
	
	ingredientAmountChanged: function (name, v)
	{
		this.model.setIngredientAmount(name, v)
	},
	
	goodSelected: function (name)
	{
		this.model.selectGoodName(name)
	},
	
	printParty: function ()
	{
		this.model.printParty()
	}
}

Papa.Controller = Me

})();
