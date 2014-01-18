<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/w/delivery/delivery.js" -->

$.onready(function ()
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		cocktails: $('#cocktails .list'),
		
		photos: $('.photos')
	}
	
	var widget = new GoodPage(nodes)
	widget.render()
})

;(function(){

eval(NodesShortcut.include())

function GoodPage (nodes)
{
	this.nodes = nodes
}

GoodPage.prototype =
{
	render: function ()
	{
		this.initCocktails()
		this.bindScroller()
	},
	
	initCocktails: function ()
	{
		var cocktails = InPageCahchedData.cocktails,
			fragment = document.createDocumentFragment()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = this.renderCocktail(cocktails[i])
			fragment.appendChild(cocktail)
		}
		
		this.nodes.cocktails.appendChild(fragment)
	},
	
	renderCocktail: function (cocktail)
	{
		var li = N('li')
		
		var a = N('a')
		a.href = cocktail.legacyUri
		li.appendChild(a)
		
		var image = Nc('div', 'image')
		a.appendChild(image)
		
		var img = N('img')
		img.src = cocktail.imageUrl
		image.appendChild(img)
		
		var name = Nct('div', 'name', cocktail.name)
		a.appendChild(name)
		
		return li
	},
	
	bindScroller: function ()
	{
		new RollingImagesLite(this.nodes.photos, {animationType: 'easeOutCubic', duration: 0.7})
	}
}

window.GoodPage = GoodPage

})();
