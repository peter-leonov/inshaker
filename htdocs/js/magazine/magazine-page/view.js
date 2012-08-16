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
	
	new RollingImagesLite(nodes.promo, {animationType: 'easeInOutQuad', duration:0.75})
	
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
		this.renderPromo(this.nodes.promo, data.promos, 1, state)
		
		var cocktailNodes = this.nodes.cocktails,
			blockNames = this.blockNames,
			blocks = data.cocktails
		
		for (var i = 0, il = blockNames.length; i < il; i++)
			this.renderCocktails(cocktailNodes[i], blocks[blockNames[i]], 1)
	},
	
	_createCocktailElement: function (cocktail)
	{
		return cocktail.getPreviewNode()
	},
	
	_createLinkElement: function (link, links)
	{
		var li = document.createElement("li")
		var a  = document.createElement("a")
		a.href = link[1]
		var img = document.createElement("img")
		img.src = "/magazine/links/" + (links.indexOf(link) + 1) + ".png"
		var txt = document.createTextNode(link[0])
		a.appendChild(img)
		a.appendChild(txt)
		li.appendChild(a)
		return li
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
	
	getPromoImages: function ()
	{
		return images = this.nodes.promo.getElementsByTagName("img")
	},
	
	loadFrames: function (list)
	{
		var images = this.getPromoImages()
		
		for (var i = 0; i < list.length; i++)
		{
			var img = images[list[i]]
			if (!img.src)
				img.src = img.getAttribute("lazy")
		}
	},
	
	getRange: function (initFrame)
	{
		var range = [initFrame]
		var images = this.getPromoImages()
		
		if (images[initFrame - 1])
			range.push(initFrame - 1)
		if (images[initFrame + 1])
			range.push(initFrame + 1)
		
		var l = images.length
		
		if (range.indexOf(1) > -1)
			range.push(l - 1) // first == last (fake)
		if (range.indexOf(l - 2) > -1)
			range.push(0) // last == first (fake)
		
		return range
	},
	
	loadInitialFrames: function (initFrame)
	{
		var range = this.getRange(initFrame)
		
		this.loadFrames(range)
	},
	
	renderCocktails: function (node, set, len)
	{
		this.renderSet(node, set, len, this._createCocktailElement)
	},
	
	renderLinks: function (node, set, len)
	{
		this.renderSet(node, set, len, this._createLinkElement)
	},
	
	renderPromo: function (node, set, len, state)
	{
		var promos = this.nodes.promos,
			surface = promos.surface,
			items = []
		
		for (var i = 0, il = set.length; i < il; i++)
		{
			var photo = this.createPromoElement(set[i])
			surface.appendChild(photo)
			items.push(photo)
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
		
		
		var me = this
		list.onstop = function (node)
		{
			var name = node.getAttribute('data-name')
			
			Statistics.magazinePromoViewed(name)
			me.controller.updateHash(name)
		}
	},
	
	renderSet: function (node, set, len, renderFunction)
	{
		var parent = $('.surface', node)
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
				point.appendChild(renderFunction(set[i], set))
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