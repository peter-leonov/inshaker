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
		
		this.processTags(this.tags)
		
		var data =
		{
			cocktails: cocktails,
			promos: this.promos
		}
		
		this.view.modelChanged(data, state)
	},
	
	processTags: function (tags)
	{
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
		
		tags.sort(function (a, b) { return b.count - a.count })
		for (var i = 0, il = tags.length; i < il; i++)
			tags[i].name = i
		
		
		var columned = [], width = 4, height = Math.ceil(tags.length / width)
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var x = (i / height) >> 0
			var y = i % height
			columned[y * width + x] = tags[i]
		}
		
		this.view.renderTags(columned)
	}
}
