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
	this.cache = {portions: []}
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
			var dx = Math.round(x / ww * lw - lw * 0.5)
			position(dx)
		}
		
		root.addEventListener('mousemove', move, false)
		position(0)
		root.removeClassName('loading')
	},
	
	bindIngredientPopup: function ()
	{
		var nodes = this.nodes
		
		function findIngredientInParents (node, deep)
		{
			do
			{
				var ingredient = node.getAttribute('data-ingredient')
				if (ingredient)
					return ingredient
			}
			while (--deep && (node = node.parentNode))
			
			return false
		}
		
		var view = this
		function maybeIngredientClicked (target)
		{
			var name = findIngredientInParents(target, 3)
			if (name)
				view.controller.ingredientSelected(name)
		}
		
		function onclick (e)
		{
			maybeIngredientClicked(e.target)
		}
		
		nodes.recipeList.addEventListener('click', onclick, false)
		nodes.ingredientPreviewList.addEventListener('click', onclick, false)
		nodes.purchasePlan.addEventListener('click', onclick, false)
		nodes.cocktailPlan.addEventListener('click', onclick, false)
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
		nodes.peopleCount.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.peopleCountChanged(e) }) }, false)
		nodes.portions.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.cocktailCountsChanged(e) }) }, false)
	},
	
	peopleCountChanged: function (e)
	{
		this.controller.peopleCountChanged(getNumberValue(e.target.value))
	},
	
	cocktailCountsChanged: function (e)
	{
		var target = e.target
		
		search:
		{
			var portionsCache = this.cache.portions
			for (var i = 0, il = portionsCache.length; i < il; i++)
			{
				var value = portionsCache[i].value
				if (target == value)
					break search
			}
			return
		}
		
		this.controller.cocktailCountChanged(i, getNumberValue(target.value))
	},
	
	renderPortions: function (portions)
	{
		var root = this.nodes.portions,
			cache = this.cache,
			portionsCache = cache.portions
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var cocktail = portions[i].cocktail
			
			var portion = Nc('li', 'portion')
			
			var name = Nc('h3', 'name')
			portion.appendChild(name)
			
			var link = Nct('a', 'link', cocktail.name)
			name.appendChild(link)
			
			var image = Nc('img', 'image')
			image.src = cocktail.getBigCroppedImageSrc()
			link.appendChild(image)
			
			var count = Nc('div', 'count')
			portion.appendChild(count)
			
			var value = Nc('input', 'value')
			count.appendChild(value)
			
			count.appendChild(T(' '))
			
			var unit = Nct('span', 'unit', ' ')
			count.appendChild(unit)
			
			// cache for updatePortions()
			portionsCache[i] =
			{
				value: value,
				unit: unit.firstChild
			}
			
			var ingredientsNode = Nc('ul', 'ingredients')
			portion.appendChild(ingredientsNode)
			
			var ingredients = cocktail.ingredients
			for (var j = 0, jl = ingredients.length; j < jl; j++)
			{
				var name = ingredients[j][0]
				
				var ingredient = Nct('li', 'ingredient', name == 'Абсент' ? 'Абсент Xenta' : name)
				ingredientsNode.appendChild(ingredient)
				
				ingredient.setAttribute('data-ingredient', name)
				ingredientsNode.appendChild(ingredient)
			}
			
			root.appendChild(portion)
		}
	},
	
	updatePortions: function (portions)
	{
		var portionsCache = this.cache.portions
		
		for (var i = 0, il = portions.length; i < il; i++)
		{
			var portion = portions[i]
			
			var c = portionsCache[i]
			c.value.value = portion.count
			c.unit.nodeValue = portion.count.pluralA(portion.cocktail.getPlurals())
		}
	},
	
	updatePeopleCount: function (count)
	{
		this.nodes.peopleCount.value = count
	},
	
	updateUnit: function (n, portion)
	{
		var p = this.cache.portions[n]
		p.unit.nodeValue = portion.count.pluralA(portion.cocktail.getPlurals())
	},
	
	guessParty: function ()
	{
		var name = this.nodes.partyName.getAttribute('data-value')
		this.controller.partyNameGuessed(name)
	}
}

Papa.View = Me

})();
