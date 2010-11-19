function MagazinePageModel ()
{
	MagazinePageModel.name = "MagazinePageModel"
	this.constructor = MagazinePageModel
	this.initialize.apply(this, arguments)
}

MagazinePageModel.prototype =
{
	initialize: function (params)
	{
		for(var key in params)
			this[key] = params[key]
	},
	
	setState: function (state)
	{
		var blocks = this.cocktails,
			cocktails = {}
		
		for (var k in blocks)
			cocktails[k] = blocks[k].map(function (v) { return Cocktail.getByName(v) })
		
		var data =
		{
			cocktails: cocktails,
			promos: this.promos
		}
		
		this.view.modelChanged(data, state)
	}
}
