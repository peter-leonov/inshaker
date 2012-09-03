;(function(){

eval(NodesShortcut.include())

var UrlEncodeLight = {}
Object.extend(UrlEncodeLight, UrlEncode)
UrlEncodeLight.encode = function (v) { return ('' + v).replace('&', '%26') }
UrlEncodeLight.decode = function (v) { return ('' + v).replace('%26', '&') }

function Me (nodes)
{
	this.nodes = nodes
	this.switchBlock = false
	this.blockNames = ['special', 'pop', 'author', 'classic']
	
	var cocktails = nodes.cocktails
	for(var i = 0; i < cocktails.length; i++)
		new RollingImagesLite(cocktails[i], {animationType: 'easeOutQuad'})
}

Me.prototype =
{
	start: function ()
	{
		this.controller.start()
	},
	
	modelChanged: function (data, state)
	{
		this.renderPromo(this.nodes.promos.root, data.promos, 1, state)
		
		var cocktailNodes = this.nodes.cocktails,
			blockNames = this.blockNames,
			blocks = data.cocktails
		
		for (var i = 0, il = blockNames.length; i < il; i++)
			this.renderCocktails(cocktailNodes[i], blocks[blockNames[i]])
	},
	
	createPromoElement: function (promo)
	{
		var a  = document.createElement("a")
		a.href = promo.href
		a.setAttribute('data-name', promo.name)
		var img = document.createElement("img")
		img.alt = promo.name
		img.setAttribute("data-lazy", "/magazine/promos/" + (promo.html_name) + ".jpg")
		a.appendChild(img)
		a.className = "point"
		return a
	},
	
	renderPromo: function (node, set, len, state)
	{
		var promos = this.nodes.promos,
			surface = promos.surface,
			items = [],
			promoNodes = {}
		
		for (var i = 0, il = set.length; i < il; i++)
		{
			var setOne = set[i],
				promo = this.createPromoElement(setOne)
			
			surface.appendChild(promo)
			items.push(promo)
			promoNodes[setOne.name] = promo
		}
		
		var total = items.length, last
		if (total > 1)
			last = surface.appendChild(items[0].cloneNode(true))
		
		var list = new LazyList()
		list.bind(promos)
		list.configure({pageLength: 1, friction: 100, pageVelocity: 47.5, soft: Infinity, min: 75, max: 100})
		list.load = function (nodes)
		{
			for (var i = 0, il = nodes.length; i < il; i++)
			{
				// buggy in Firefox 3.5
				var image = nodes[i].firstChild
				if (!image.src)
					image.src = image.getAttribute('data-lazy')
			}
		}
		list.setNodes(items, total)
		list.load([last])
		
		var lh = new LocationHash(),
			hash = UrlEncode.parse(lh.get())
		
		if (hash.name)
			list.jumpToNode(promoNodes[hash.name])
		
		var me = this
		list.onstop = function (node)
		{
			var name = node.getAttribute('data-name')
			
			Statistics.magazinePromoViewed(name)
			me.controller.updateHash(name)
		}
	},
	
	renderCocktails: function (node, set)
	{
		var parent = $('.surface', node)
		parent.empty()
		for (var i = 0; i < set.length; i++)
		{
			var cocktail = set[i]
			if (!cocktail)
				continue
			
				
			var point = document.createElement('ul')
			point.className = 'point'
			parent.appendChild(point)
			
			point.appendChild(cocktail.getPreviewNode())
		}
		node.RollingImagesLite.sync()
	},
	
	renderTags: function (tags)
	{
		var list = this.nodes.tagsList
		
		list.empty()
		
		var columned = [], width = 4, height = Math.ceil(tags.length / width)
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var x = (i / height) >> 0
			var y = i % height
			
			var tag = tags[i]
			columned[y * width + x] = tag
			if (y == height - 1 || i == il - 1)
				tag.bottom = true
		}
		
		for (var i = 0, il = columned.length; i < il; i++)
		{
			var tag = columned[i]
			
			if (!tag)
			{
				list.appendChild(Nc('span', 'space'))
				continue
			}
			
			var item = Nc('a', (tag.bottom ? 'item bottom' : 'item') + ' ' +  tag.id)
			list.appendChild(item)
			item.href = '/combinator.html#' + UrlEncodeLight.stringify(tag.link)
			
			var name = Nct('span', 'name', tag.name)
			item.appendChild(name)
			
			var icon = Nc('span', 'icon')
			item.appendChild(icon)
			
			var count = Nct('span', 'count', tag.count)
			item.appendChild(count)
		}
	}
}

Me.className = 'MagazinePageView'
self[Me.className] = Me

})();