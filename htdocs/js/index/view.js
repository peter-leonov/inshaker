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
		new Programica.RollingImagesLite(nodes.promo, {animationType: 'easeInOutQuad', duration:0.75})
        new Programica.RollingImagesLite(nodes.links, {animationType: 'easeOutQuad'})
		new Programica.RollingImagesLite(nodes.cocktails, {animationType: 'easeOutQuad'})
    },
	
	start: function ()
	{
	    new NewsFormPopup(this.nodes.dontMiss)
        this.controller.start()
    },

 	modelChanged: function (data)
	{
        this.renderPromo(this.nodes.promo, data.promos, 1)
        this.renderLinks(this.nodes.links, data.links, 1)
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

  _createPromoElement: function (promo, promos)
  {
    var li = document.createElement("li")
    var a  = document.createElement("a")
    a.href = promo[1]
    var img = document.createElement("img")
    img.alt = promo[0]
    img.src = "/i/index/promos/" + (promos.indexOf(promo) + 1) + ".jpg"
    a.appendChild(img)
    li.appendChild(a)
    return li
  },
	
  renderCocktails: function (node, set, len)
  {
    this.renderSet(node, set, len, this._createCocktailElement)
  },
  
  renderLinks: function (node, set, len)
  {
    this.renderSet(node, set, len, this._createLinkElement)
  },
  
  renderPromo: function (node, set, len)
  {
    var ri = node.RollingImagesLite
    var parent = node.getElementsByClassName('surface')[0]
    var point = null
    
	parent.empty()
	for (var i = 0; i < set.length; i++)
	{
		point = document.createElement('ul')
		point.className = 'point'
		parent.appendChild(point)
		point.appendChild(this._createPromoElement(set[i], set))
	}	
    
   
    if(set.length > 1)
    {
        point = document.createElement('ul')
	    point.className = 'point'
	    parent.appendChild(point)
        point.appendChild(this._createPromoElement(set[0], set))
        var switchFrame = function ()
        {
		    var len = ri.points.length, cur = ri.current
		
		    if(cur == len - 2) {
			    var animation = ri.goToFrame(cur + 1)
			    animation.oncomplete = function () { ri.goToFrame(0, 'directJump') }
		    } else {
			    ri.goToFrame(cur + 1)
		    }
	    }
	    var frameSwitchTimer = setInterval(switchFrame, 3500)
	    var removedLast = false
	    parent.addEventListener('mouseover', function ()
	    { 
		    clearInterval(frameSwitchTimer)
		    if(!removedLast)
		    {
			    parent.removeChild(point)
			    ri.sync()
			    removedLast = true
		    }
	    }, false)
	} else {
        this.nodes.arrows[0].hide()
        this.nodes.arrows[1].hide()
    }
	node.RollingImagesLite.sync()
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
