BarPage.model =
{
	owner: null, // must be defined before initialize
	
	initialize: function (barsDB, cocktailsDB)
	{
		this.barsDB = barsDB
		this.cocktailsDB = cocktailsDB
	},
	
	getCocktailsByNames: function (arr)
	{
		var res = [],
			cocktailsDB = this.cocktailsDB
		for (var i = 0; i < arr.length; i++)
			res[i] = cocktailsDB.getByName(arr[i])
		return res
	},
	
	setBarCity: function (barId, cityName)
	{
		var bar = this.barsDB.getBarByCityId(cityName, barId)
		var recommendations = this.getCocktailsByNames(bar.recs)
		var carte = this.getCocktailsByNames(bar.carte)

		var otherBarsSet = this.barsDB.getAllBarsByCity(cityName)
		
		this.owner.view.modelChanged(bar, recommendations, carte, otherBarsSet)
	}
}