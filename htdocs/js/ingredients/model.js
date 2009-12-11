;(function(){

var Papa = IngredientsPage, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
	},
	
	bind: function (ds)
	{
		this.ds = ds
		this.all = ds.ingredient.getAll()
		this.groups = this.ds.ingredient.getGroups()
		Ingredient.calculateEachIngredientUsage()
	},
	
	setState: function (state)
	{
		this.state = state
		
		var data, all = this.all
		
		if (state.groupBy == 'group')
			data = this.groupByGroup(all)
		else
			data = [{list: all}]
		
		
		var func
		if (state.sortBy == 'usage')
			func = this.sortByUsage
		// ingredients are already alphabetically sorted
		// else if (state.sortBy == 'alphabet')
		// 	func = this.sortByAlphabet
		
		if (func)
			this.sortBy(data, func)
		
		this.data = data
		this.view.modelChanged(data)
	},
	
	groupByGroup: function (all)
	{
		var data = []
		{
			var slices = {}, groups = this.groups
			for (var i = 0; i < groups.length; i++)
			{
				var list = [], name = groups[i]
				slices[name] = list
				data.push({name: name, list: list})
			}
			
			for (var i = 0; i < all.length; i++)
			{
				var ingred = all[i]
				slices[ingred.group].push(ingred)
			}
		}
		return data
	},
	
	sortBy: function (data, func)
	{
		for (var i = 0; i < data.length; i++)
			data[i].list.sort(func)
	},
	
	sortByAlphabet: function (a, b) { return a.name.localeCompare(b.name) },
	
	// this is possible only after Ingredient.calculateEachIngredientUsage()
	sortByUsage: function (a, b) { return b.cocktails.length - a.cocktails.length }
}

Object.extend(Me.prototype, myProto)

})();