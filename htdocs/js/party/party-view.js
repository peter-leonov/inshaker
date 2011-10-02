;(function(){

function getIntegerValue (v)
{
	// to string
	v = '' + v
	// clean up all non-digital chars
	v = v.replace(/,/g, '.')
	v = v.replace(/[^0-9\-\.]+/g, '')
	// convert to number base 10
	v = parseFloat(v, 10)
	// convert NaN to 0
	v = isNaN(v) ? 0 : v
	
	return Math.ceil(v)
}

function getFloatValue (v)
{
	// to string
	v = '' + v
	// clean up all non-digital chars
	v = v.replace(/,/g, '.')
	v = v.replace(/[^0-9\-\.]+/g, '')
	// convert to number base 10
	v = parseFloat(v, 10)
	// convert NaN to 0
	v = isNaN(v) ? 0 : v
	
	return v
}


function Me ()
{
	this.nodes = {}
	this.cache = {portions: [], plan: []}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.loadWindow()
		this.bindIngredientPopup()
		this.bindEvents()
		this.bindShareBox()
		
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
		
		function blurInteger (e)
		{
			var target = e.target
			target.value = getIntegerValue(target.value)
		}
		
		function blurFloat (e)
		{
			var target = e.target
			target.value = getFloatValue(target.value)
		}
		
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
		nodes.peopleCount.addEventListener('blur', blurInteger, true)
		nodes.portions.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.cocktailCountChanged(e) }) }, false)
		nodes.portions.addEventListener('blur', blurInteger, true)
		nodes.purchasePlanList.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.ingredientAmountChanged(e) }) }, false)
		nodes.purchasePlanList.addEventListener('blur', blurFloat, true)
	},
	
	peopleCountChanged: function (e)
	{
		this.controller.peopleCountChanged(getIntegerValue(e.target.value))
	},
	
	cocktailCountChanged: function (e)
	{
		var target = e.target
		this.controller.cocktailCountChanged(target.dataInListNumber, getIntegerValue(target.value))
	},
	
	ingredientAmountChanged: function (e)
	{
		var target = e.target
		this.controller.ingredientAmountChanged(target.dataInListNumber, getFloatValue(target.value))
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
			link.href = cocktail.getPath()
			name.appendChild(link)
			
			var image = Nc('img', 'image')
			link.appendChild(image)
			image.src = cocktail.getBigCroppedImageSrc()
			
			var count = Nc('div', 'count')
			portion.appendChild(count)
			
			var value = Nc('input', 'value')
			count.appendChild(value)
			value.dataInListNumber = i
			
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
	
	renderPlan: function (plan)
	{
		var root = this.nodes.purchasePlanList,
			planCache = this.cache.plan
		
		for (var i = 0, il = plan.length; i < il; i++)
		{
			var ingredient = plan[i].ingredient,
				cache = planCache[i] = {}
			
			var item = Nc('li', 'ingredient')
			root.appendChild(item)
			
			var name = Nct('span', 'name', ingredient.name == 'Абсент' ? 'Абсент Xenta' : ingredient.name)
			item.appendChild(name)
			name.setAttribute('data-ingredient', ingredient.name)
			
			
			var amount = Nc('span', 'amount')
			item.appendChild(amount)
			
			var value = Nc('input', 'value')
			amount.appendChild(value)
			value.dataInListNumber = i
			cache.amount = value
			
			amount.appendChild(T(' '))
			
			var unit = Nct('span', 'unit', ingredient.unit)
			amount.appendChild(unit)
			
			
			var cost = Nc('span', 'cost')
			item.appendChild(cost)
			
			var value = Nct('span', 'value', ' ')
			cost.appendChild(value)
			cache.cost = value.firstChild
			
			cost.appendChild(T(' '))
			
			var unit = Nct('span', 'unit', 'р.')
			cost.appendChild(unit)
		}
	},
	
	updatePlan: function (plan)
	{
		var planCache = this.cache.plan,
			totalNodes = this.nodes.purchasePlanTotal
		
		for (var i = 0, il = plan.length; i < il; i++)
		{
			var buy = plan[i],
				item = planCache[i]
			
			item.amount.value = buy.amount
			item.cost.nodeValue = buy.cost
		}
	},
	
	updateTotal: function (total)
	{
		var totalNodes = this.nodes.purchasePlanTotal
		
		totalNodes.value.firstChild.nodeValue = total
		totalNodes.unit.firstChild.nodeValue = total.plural('рубль', 'рубля', 'рублей')
	},
	
	updateBuy: function (n, buy)
	{
		var planCache = this.cache.plan
		
		var item = planCache[n]
		item.cost.nodeValue = buy.cost
	},
	
	renderPeopleCount: function (count)
	{
		this.nodes.peopleCount.value = count
	},
	
	updatePeopleUnit: function (count)
	{
		this.nodes.peopleUnit.firstChild.nodeValue = count.plural('человека', 'человек', 'человек')
	},
	
	updateUnit: function (n, portion)
	{
		var p = this.cache.portions[n]
		p.unit.nodeValue = portion.count.pluralA(portion.cocktail.getPlurals())
	},
	
	bindShareBox: function ()
	{
		var nodes = this.nodes
		
		var share = new ShareBox()
		share.bind(nodes.shareBox)
		share.render(window.location.href, nodes.partyName.firstChild.nodeValue)
	},
	
	guessParty: function ()
	{
		var name = this.nodes.partyName.getAttribute('data-value')
		this.controller.partyNameGuessed(name)
	}
}

Papa.View = Me

})();
