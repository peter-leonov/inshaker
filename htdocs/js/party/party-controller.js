;(function(){

function Me ()
{
	
}

Me.prototype =
{
	partyNameGuessed: function (name)
	{
		this.model.setPartyName(name)
	},
	
	peopleCountChanged: function (v)
	{
		this.model.setPeaopleCount(v)
	},
	
	cocktailCountChanged: function (n, v)
	{
		this.model.setCocktailCount(n, v)
	}
}

Papa.Controller = Me

})();
