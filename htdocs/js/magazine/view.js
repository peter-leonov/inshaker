;(function(){

eval(NodesShortcut.include())

var UrlEncodeLight = {}
Object.extend(UrlEncodeLight, UrlEncode)
UrlEncodeLight.encode = function (v) { return ('' + v).replace('&', '%26') }
UrlEncodeLight.decode = function (v) { return ('' + v).replace('%26', '&') }

function Me (nodes)
{
	this.nodes = nodes
	this.imagesLoaded = false
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
		var img = document.createElement("img")
		img.alt = promo.name
		img.setAttribute("lazy", "/magazine/promos/" + (promo.html_name) + ".jpg")
		a.appendChild(img)
		a.className = "point"
		return a
	},
	
	getPromoImages: function ()
	{
		return images = this.nodes.promo.getElementsByTagName("img")
	},
	
	loadFrames: function (list, onImageLoaded)
	{
		var images = this.getPromoImages()
		
		for (var i = 0; i < list.length; i++)
		{
			var img = images[list[i]]
			if (!img.src)
			{
				img.src = img.getAttribute("lazy")
				if (onImageLoaded)
					img.onload = onImageLoaded
			}
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
		var me = this, counter = 0
		var range = this.getRange(initFrame)
		
		this.loadFrames
		(
			range,
			function ()
			{
				counter++
				if (counter == range.length)
					me.imagesLoaded = true
			}
		)
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
		var ri = node.RollingImagesLite
		var parent = node.getElementsByClassName('surface')[0]
		
		parent.empty()
		
		// One fake before the actual series, one after
		parent.appendChild(this.createPromoElement(set[set.length - 1]))
		for (var i = 0; i < set.length; i++)
			parent.appendChild(this.createPromoElement(set[i]))
		parent.appendChild(this.createPromoElement(set[0]))
		ri.sync()
		
		if (set.length > 1)
		{
			var len = ri.points.length, me = this
			// Jumping to avoid fakes
			function switchFrame (prev)
			{
				if (!me.switchBlock)
				{
					var cur = ri.current, after = cur
					
					me.switchBlock = true
					function switchUnblock () { me.switchBlock = false }
					function jumpToAfter () { ri.goToFrame(after, 'directJump'); switchUnblock() }
					function slideToAfter () { ri.goToFrame(after).oncomplete = switchUnblock }
					
					if (prev)
					{
						if (cur == 1)
						{
							after = len - 2
							ri.goToFrame(0).oncomplete = jumpToAfter
						}
						else
						{
							after = cur - 1
							slideToAfter()
						}
					}
					else
					{
						if (cur == len - 2)
						{
							after = 1
							ri.goToFrame(len - 1).oncomplete = jumpToAfter
						}
						else
						{
							after = cur + 1
							slideToAfter()
						}
					}
					
					var promo = set[after-1]
					Statistics.magazinePromoViewed(promo)
					me.controller.updateHash(promo.name)
					me.loadFrames(me.getRange(after))
				}
			}
			
			this.nodes.arrows[0].addEventListener('click', function (e) { switchFrame(true)  }, false)
			this.nodes.arrows[1].addEventListener('click', function (e) { switchFrame(false) }, false)
			
			var initFrame = state.initFrame
			for (var i = 0; i < set.length; i++)
				if (set[i].name == initFrame)
				{
					initFrame = i + 1
					break
				}
			
			if (!initFrame)
				initFrame = 1//Math.round(Math.random() * (len - 1)) + 1
			if (!this.getPromoImages()[initFrame])
				initFrame = 1
			
			this.loadInitialFrames(initFrame)
			ri.jumpToFrame(initFrame)
			
			// Wait for initial images to load and start switching
			var tries = 0
			var imageLoadTimer = setInterval
			(
				function ()
				{
					if (me.imagesLoaded || tries++ > 10)
						clearInterval(imageLoadTimer)
				},
				100
			)
		}
	},
	
	renderSet: function (node, set, len, renderFunction)
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