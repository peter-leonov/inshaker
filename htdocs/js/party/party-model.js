;(function(){

function Me ()
{
	this.cocktails = []
}

Me.prototype =
{
	setPartyName: function (name)
	{
		this.party = Party.getByName(name)
		
		this.setupCocktails(this.party.cocktails)
	},
	
	setupCocktails: function (source)
	{
		var cocktails = this.cocktails = []
		for (var i = 0, il = source.length; i < il; i++)
		{
			var s = source[i]
			cocktails.push({cocktail: Cocktail.getByName(s.name), factor: s.factor})
		}
		
		this.view.renderCocktails(cocktails)
	},
	
	setupPeaopleCount: function (count)
	{
		this.view.updatePeopleCount(count)
		this.setPeaopleCount(count)
	},
	
	setPeaopleCount: function (count)
	{
		this.peopleCount = count
		
		var counts = []
		
		var cocktails = this.cocktails
		for (var i = 0, il = cocktails.length; i < il; i++)
			counts[i] = Math.ceil(cocktails[i].factor * count)
		
		this.view.updateCocktails(counts)
	}
}

Papa.Model = Me

})();
