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
		{
			var block = blocks[k]
			
			var all = block[0].concat(block[1].slice().randomize())
			cocktails[k] = all.map(function (v) { return Cocktail.getByName(v) })
		}
		
		var tags = this.tags
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			tags[i] =
			{
				name: tag,
				count: Cocktail.getByTag(tag).length
			}
		}
		
		var data =
		{
			cocktails: cocktails,
			promos: this.promos,
			tags: this.tags
		}
		
		this.view.modelChanged(data, state)
	}
}
