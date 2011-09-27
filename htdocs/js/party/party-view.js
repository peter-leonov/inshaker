;(function(){

function getNumberValue (v)
{
	// to string
	v = '' + v
	// clean up all non-digital chars
	v = v.replace(/[^0-9\-]+/g, '')
	// convert to number base 10
	v = parseInt(v, 10)
	// convert NaN to 0
	v = isNaN(v) ? 0 : v
	
	return v
}


function Me ()
{
	this.nodes = {}
	this.cache = {cocktailCounts: [], cocktailUnits: []}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		// this.loadWindow()
		this.bindIngredientPopup()
		this.bindEvents()
		
		return this
	},
	
	loadWindow: function ()
	{
		var nodes = this.nodes.window,
			layers = nodes.layers
		
		var me = this, count = 0
		function onload ()
		{
			if (++count == layers.length)
				me.bindWindow()
		}
		
		for (var i = 0, il = layers.length; i < il; i++)
		{
			var image = layers[i].firstChild
			image.addEventListener('load', onload, false)
			image.src = image.getAttribute('lazy-src')
		}
	},
	
	bindWindow: function ()
	{
		var nodes = this.nodes.window,
			root = nodes.root, layers = nodes.layers
		
		var factors = []
		for (var i = 0, il = layers.length; i < il; i++)
			factors[i] = layers[i].getAttribute('data-factor') * 0.5
		
		var ww = root.offsetWidth,
			lw = layers[0].scrollWidth
		
		var middle = (lw - ww) * 0.5
		
		var left = root.offsetLeft
		
		var lastDx
		function position (dx)
		{
			if (lastDx == dx)
				return
			lastDx = dx
			
			for (var i = 0, il = layers.length; i < il; i++)
				layers[i].scrollLeft = middle + dx * factors[i]
		}
		
		function move (e)
		{
			var x = e.clientX - left
			var dx = Math.round(lw * 0.5 - x / ww * lw)
			position(dx)
		}
		
		root.addEventListener('mousemove', move, false)
		position(0)
		root.removeClassName('loading')
	},
	
	bindIngredientPopup: function ()
	{
		var nodes = this.nodes
		
		function findIngredientInParents (node)
		{
			do
			{
				var ingredient = node.getAttribute('data-ingredient')
				if (ingredient)
					return ingredient
			}
			while ((node = node.parentNode))
			
			return false
		}
		
		var view = this
		function maybeIngredientClicked (target)
		{
			var name = findIngredientInParents(target)
			if (name)
				view.controller.ingredientSelected(name)
		}
		
		function onclick (e)
		{
			maybeIngredientClicked(e.target)
		}
		
		nodes.recipeList.addEventListener('click', onclick, false)
	},
	
	showIngredientPopup: function (ingredient)
	{
		IngredientPopup.show(ingredient)
	},
	
	bindEvents: function ()
	{
		var nodes = this.nodes
		
		function blur (e)
		{
			var target = e.target
			target.value = getNumberValue(target.value)
		}
		document.addEventListener('blur', blur, true)
		
		function ifReallyChanged (e, f)
		{
			var target = e.target
			
			var before = target.value
			function after ()
			{
				if (before != target.value)
					f()
			}
			setTimeout(after, 0)
		}
		
		var view = this
		nodes.peopleCount.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.peopleCountChanged(e) }, 0) }, false)
		nodes.cocktails.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.cocktailCountsChanged(e) }, 0) }, false)
	},
	
	peopleCountChanged: function (e)
	{
		this.controller.peopleCountChanged(getNumberValue(e.target.value))
	},
	
	cocktailCountsChanged: function (e)
	{
		var target = e.target
		var data = []
		
		var counts = this.cache.cocktailCounts
		for (var i = 0, il = counts.length; i < il; i++)
			if (target == counts[i])
				break
		
		if (!counts[i])
			return
		
		this.controller.cocktailCountChanged(i, getNumberValue(target.value))
	},
	
	renderCocktails: function (source)
	{
		var root = this.nodes.cocktails,
			cache = this.cache,
			counts = cache.cocktailCounts, units = cache.cocktailUnits
		
		for (var i = 0, il = source.length; i < il; i++)
		{
			var s = source[i]
			
			var item = Nc('li', 'portion')
			
			var cocktail = s.cocktail.getLinkNodeBig()
			item.appendChild(cocktail)
			
			var control = Nc('div', 'control')
			item.appendChild(control)
			
			var count = Nc('input', 'count')
			control.appendChild(count)
			counts[i] = count
			
			var unit = Nct('span', 'unit', ' ')
			control.appendChild(unit)
			units[i] = unit.firstChild
			
			root.appendChild(item)
		}
	},
	
	updateCocktails: function (data)
	{
		var cache = this.cache,
			counts = cache.cocktailCounts, units = cache.cocktailUnits
		
		for (var i = 0, il = counts.length; i < il; i++)
		{
			var v = data[i]
			counts[i].value = v
			units[i].nodeValue = v.plural('порция', 'порции', 'порций')
		}
	},
	
	updatePeopleCount: function (count)
	{
		this.nodes.peopleCount.value = count
	},
	
	guessParty: function ()
	{
		var name = this.nodes.partyName.getAttribute('data-value')
		this.controller.partyNameGuessed(name)
	}
}

Papa.View = Me

})();
