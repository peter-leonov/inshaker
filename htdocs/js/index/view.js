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
		this.imagesLoaded = false
		this.switchBlock = false
		
		new Programica.RollingImagesLite(nodes.promo, {animationType: 'easeInOutQuad', duration:0.75})
		new Programica.RollingImagesLite(nodes.links, {animationType: 'easeOutQuad'})
		new Programica.RollingImagesLite(nodes.cocktails, {animationType: 'easeOutQuad'})
	},
	
	start: function ()
	{
		new NewsFormPopup(this.nodes.dontMiss)
		this.controller.start()
	},
	
	modelChanged: function (data, state)
	{
		this.renderPromo(this.nodes.promo, data.promos, 1, state)
		this.renderLinks(this.nodes.links, data.links, 1)
		this.renderCocktails(this.nodes.cocktails, data.cocktails, 1)
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
		img.src = "/i/index/links/" + (links.indexOf(link) + 1) + ".png"
		var txt = document.createTextNode(link[0])
		a.appendChild(img)
		a.appendChild(txt)
		li.appendChild(a)
		return li
	},
	
	createPromoElement: function (promo, promos)
	{
		var a  = document.createElement("a")
		a.href = promo[1]
		var img = document.createElement("img")
		img.alt = promo[0]
		img.setAttribute("lazy", "/i/index/promos/" + (promos.indexOf(promo) + 1) + ".jpg")
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
		
		return range.uniq()
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
		var initFrame = state.initFrame, customInit = state.customInit
		
		var ri = node.RollingImagesLite
		var parent = node.getElementsByClassName('surface')[0]
		
		parent.empty()
		
		// One fake before the actual series, one after
		parent.appendChild(this.createPromoElement(set[set.length - 1], set))
		for (var i = 0; i < set.length; i++)
			parent.appendChild(this.createPromoElement(set[i], set))
		parent.appendChild(this.createPromoElement(set[0], set))
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
					
					me.controller.updateHash(after)
					me.loadFrames(me.getRange(after))
				}
			}
			
			this.nodes.arrows[0].addEventListener('click', function (e) { switchFrame(true)  }, false)
			this.nodes.arrows[1].addEventListener('click', function (e) { switchFrame(false) }, false)
			
			var fastSwitchTimer = null, slowSwitchTimer = null
			function startSwitching (customInit)
			{
				fastSwitchTimer = setTimeout
				(
					function ()
					{
						slowSwitchTimer = setInterval(function () { switchFrame(false) }, 4500)
						switchFrame(false)
					},
					customInit ? 6000 : 1500
				)
			}
			function stopSwitching ()
			{
				clearInterval(fastSwitchTimer)
				clearInterval(slowSwitchTimer)
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
					{
						clearInterval(imageLoadTimer)
						me.showButtons()
						// startSwitching(customInit)
						// me.nodes.promo.addEventListener('mousemove', function () { stopSwitching() }, false)
						// me.nodes.promo.addEventListener('mouseover', function () { stopSwitching() }, false)
						// me.nodes.promo.addEventListener('mouseout' , function () { startSwitching() }, false)
					}
				},
				100
			)
		}
	},
	
	showButtons: function ()
	{
		var prev = this.nodes.arrows[0], next = this.nodes.arrows[1]
		prev.show()
		next.show()
		prev.animate('easeOutBounce', {left: -29}, 0.6)
		next.animate('easeOutBounce', {left: 962}, 0.6)
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
	}
}