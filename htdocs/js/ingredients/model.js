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
		// we will mess this.all, so better make a copy
		this.all = Array.copy(ds.ingredient.getAll())
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
		else if (state.sortBy == 'alphabet')
			func = this.sortByAlphabet
		
		if (func)
			this.sortBy(data, func)
		
		
		this.data = data
		this.view.groupByChanged(state.groupBy)
		this.view.sortByChanged(state.sortBy)
		this.view.drawByChanged(state.drawBy)
		this.view.listChanged(data)
	},
	
	setGroupBy: function (type)
	{
		this.state.groupBy = type
		this.setState(this.state)
	},
	
	setSortBy: function (type)
	{
		this.state.sortBy = type
		this.setState(this.state)
	},
	
	setDrawBy: function (type)
	{
		this.state.drawBy = type
		this.setState(this.state)
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