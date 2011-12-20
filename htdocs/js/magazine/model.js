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
	
	processTags: function (names)
	{
		var tags = []
		for (var i = 0, il = names.length; i < il; i++)
		{
			var name = names[i]
			
			var count = Cocktail.getByTag(name).length
			if (!count)
				continue
			
			var id = name.replace(/\s/, '-').toLowerCase()
			
			tags.push({name: name, count: count, id: id, link: {q: name}})
		}
		
		tags.sort(function (a, b) { return b.count - a.count })
		
		var all = tags[0]
		all.link.s = 'by-date'
		
		this.view.renderTags(tags)
	}
}
