function IndexPageModel ()
{
	IndexPageModel.name = "IndexPageModel"
	this.constructor = IndexPageModel
	this.initialize.apply(this, arguments)
}

IndexPageModel.prototype =
{
	initialize: function (params)
	{
		for(var key in params)
			this[key] = params[key]
	},
	
	setState: function (state)
	{
		var data =
		{
			cocktails: this.cocktails.map(function (v) { return Cocktail.getByName(v) }),
			links: this.links,
			promos: this.promos
		}
		
		this.view.modelChanged(data, state)
	}
}
