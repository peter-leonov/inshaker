;(function(){

function Me () {}

Me.prototype =
{
	getCocktailsByNames: function (arr)
	{
		var res = []
		for (var i = 0; i < arr.length; i++)
			res[i] = Cocktail.getByName(arr[i])
		return res
	},
	
	setQuery: function (query)
	{
		var bar = Bar.getByCityName(query.city, query.name)
		if (!bar)
			return
		
		var data =
		{
			bar: bar,
			carte: this.getCocktailsByNames(bar.carte),
			otherBarsSet: Bar.getAllByCity(query.city)
		}
		
		this.view.modelChanged(data)
	}
}

Papa.Model = Me

})();
