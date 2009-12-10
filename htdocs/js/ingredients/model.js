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
	},
	
	setState: function (state)
	{
		this.state = state
		
		var all = this.all,
			data = this.data = []
		
		if (state.groupBy == 'group')
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
		
		this.view.modelChanged(data)
	}
}

Object.extend(Me.prototype, myProto)

})();