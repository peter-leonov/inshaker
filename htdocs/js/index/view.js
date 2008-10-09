function IndexPageView ()
{
	IndexPageView.name = "IndexPageView"
	this.constructor = IndexPageView
	this.initialize.apply(this, arguments)
}

IndexPageView.prototype =
{
	initialize: function (nodes)
	{
		this.nodes = nodes
		
		new Programica.RollingImagesLite(nodes.cocktails, {animationType: 'easeOutQuad'})
	},
	
	start: function ()
	{
		this.controller.start()
	},
	
	modelChanged: function (data)
	{
		this.renderCocktails(this.nodes.cocktails, data.cocktails, 1)
	},
	
	_createCocktailElement: function (cocktail)
	{
		var li = document.createElement("li")
		var a = document.createElement("a")
		a.href = "/cocktails/" + cocktail.name_eng.htmlName() + ".html"
		var img = document.createElement("img")
		img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png"
		var txt = document.createTextNode(cocktail.name)
		a.appendChild(img)
		a.appendChild(txt)
		li.appendChild(a)
		return li
	},
	
	renderCocktails: function (node, set, len)
	{
		var parent = node.getElementsByClassName('surface')[0]
		parent.empty()
		for (var i = 0; i < set.length; i++)
		{
			if (i % len == 0)
			{
				var point = document.createElement('ul')
				point.className = 'point'
				parent.appendChild(point)
			}
			if (set[i])
			point.appendChild(this._createCocktailElement(set[i]))
		}
		node.RollingImagesLite.sync()
	}
	
}
