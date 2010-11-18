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
		var data =
		{
			cocktails: this.cocktails.map(function (x) { return x.map(function(v){return Cocktail.getByName(v)}) }),
			promos: this.promos
		}
		
		this.view.modelChanged(data, state)
	}
}
