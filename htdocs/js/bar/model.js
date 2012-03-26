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
	
	getPrevNext: function (name, query)
	{
		query = query || {}
		
		var bars = Bar.getByQuery(query)
		if (!bars)
			return []
		
		for (var i = 0; i < bars.length; i++)
			if (bars[i].name == name)
				return [bars[i-1], bars[i+1]]
		
		return []
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
			otherBarsSet: Bar.getAllByCity(query.city),
			prevNext: this.getPrevNext(query.name, {city: query.city, format: query.format, feel: query.feel})
		}
		
		this.view.modelChanged(data)
	}
}

Papa.Model = Me

})();
