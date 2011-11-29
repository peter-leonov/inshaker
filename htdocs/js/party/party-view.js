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
		this.bindGoodPopup()
		this.bindEvents()
		this.bindShareBox()
		this.bindPrintBox()
		
		return this
	},
	
	loadWindow: function ()
	{
		var nodes = this.nodes.window,
			images = nodes.images
		
		var me = this, count = 0
		function onload ()
		{
			if (++count == images.length)
				me.bindWindow()
		}
		
		for (var i = 0, il = images.length; i < il; i++)
		{
			var image = images[i]
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
			
			root.className = 'rendering'
			for (var i = 0, il = layers.length; i < il; i++)
				layers[i].scrollLeft = middle + dx * factors[i]
			root.className = ''
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
	
	bindGoodPopup: function ()
	{
		var nodes = this.nodes
		
		function findIngredientInParents (node, deep)
		{
			do
			{
				var ingredient = node.getAttribute('data-good')
				if (ingredient)
					return ingredient
			}
			while (--deep && (node = node.parentNode))
			
			return false
		}
		
		var view = this
		function maybeGoodClicked (target)
		{
			var name = findIngredientInParents(target, 3)
			if (name)
				view.controller.goodSelected(name)
		}
		
		function onclick (e)
		{
			maybeGoodClicked(e.target)
		}
		
		nodes.recipeList.addEventListener('click', onclick, false)
		nodes.purchasePlan.addEventListener('click', onclick, false)
		nodes.cocktailPlan.addEventListener('click', onclick, false)
	},
	
	showGoodPopup: function (good)
	{
		IngredientPopup.show(good)
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
		nodes.ingredientsPartList.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.ingredientAmountChanged(e) }) }, false)
		nodes.ingredientsPartList.addEventListener('blur', blurFloat, true)
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
		this.controller.ingredientAmountChanged(target.dataGoodID, getFloatValue(target.value))
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
			
			var parts = cocktail.parts
			for (var j = 0, jl = parts.length; j < jl; j++)
			{
				var name = parts[j].ingredient.name
				
				var ingredient = Nct('li', 'ingredient', name == 'Абсент' ? 'Абсент Xenta' : name)
				ingredientsNode.appendChild(ingredient)
				
				ingredient.setAttribute('data-good', name)
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
		var byGroup =
		{
			tools: [],
			ingredients: []
		}
		
		for (var i = 0, il = plan.length; i < il; i++)
		{
			var buy = plan[i]
			byGroup[buy.group].push(buy)
		}
		
		this.renderIngredientsPlan(byGroup.ingredients)
		this.renderIngredientsPreviewList(byGroup.ingredients)
		
		this.renderToolsPlan(byGroup.tools)
		this.renderToolsPreviewList(byGroup.tools)
	},
	
	renderIngredientsPlan: function (plan)
	{
		this.renderPlanTo(plan, this.nodes.ingredientsPartList)
	},
	
	renderToolsPlan: function (plan)
	{
		this.renderPlanTo(plan, this.nodes.toolsPartList)
	},
	
	renderPlanTo: function (plan, root)
	{
		if (plan.length == 0)
		{
			root.hide()
			return
		}
		root.show()
		
		var planCache = this.cache.plan
		for (var i = 0, il = plan.length; i < il; i++)
		{
			var buy = plan[i],
				good = buy.good,
				cache = planCache[buy.id] = {}
			
			var item = Nc('li', 'ingredient')
			root.appendChild(item)
			
			var name = Nct('span', 'name', good.name == 'Абсент' ? 'Абсент Xenta' : good.name)
			item.appendChild(name)
			name.setAttribute('data-good', good.name)
			
			
			var amount = Nc('span', 'amount')
			item.appendChild(amount)
			
			var value = Nc('input', 'value')
			amount.appendChild(value)
			value.dataGoodID = buy.id
			cache.amount = value
			
			amount.appendChild(T(' '))
			
			var unit = Nct('span', 'unit', ' ')
			amount.appendChild(unit)
			cache.unit = unit.firstChild
			
			
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
	
	renderIngredientsPreviewList: function (plan)
	{
		this.renderPreviewListTo(plan, this.nodes.ingredientsPartPreviewList)
	},
	
	renderToolsPreviewList: function (plan)
	{
		this.renderPreviewListTo(plan, this.nodes.toolsPartPreviewList)
	},
	
	renderPreviewListTo: function (plan, root)
	{
		root.empty()
		
		for (var i = 0, il = plan.length; i < il; i++)
		{
			var good = plan[i].good
			
			var item = Nc('li', 'item ingredient-preview')
			root.appendChild(item)
			item.setAttribute('data-good', good.name)
			item.style.backgroundImage = 'url(' + good.getMiniImageSrc() + ')'
			
			var image = Nc('img', 'image')
			item.appendChild(image)
			image.src = good.getMiniImageSrc()
			
			var name = Nct('span', 'name', good.name)
			item.appendChild(name)
		}
	},
	
	updatePlan: function (plan)
	{
		var planCache = this.cache.plan,
			totalNodes = this.nodes.purchasePlanTotal
		
		for (var i = 0, il = plan.length; i < il; i++)
		{
			var buy = plan[i],
				item = planCache[buy.id]
			
			var human = Units.humanizeDose(buy.amount, buy.good.unit)
			
			item.amount.value = buy.amountHumanized
			item.unit.nodeValue = buy.unitHumanized
			item.cost.nodeValue = buy.cost
		}
	},
	
	updateTotal: function (total)
	{
		var totalNodes = this.nodes.purchasePlanTotal
		
		totalNodes.value.firstChild.nodeValue = total
		totalNodes.unit.firstChild.nodeValue = total.plural('рубль', 'рубля', 'рублей')
	},
	
	updateBuy: function (id, buy)
	{
		var planCache = this.cache.plan
		
		var item = planCache[id]
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
	
	bindPrintBox: function ()
	{
		var nodes = this.nodes
		
		var controller = this.controller
		nodes.printButton.addEventListener('click', function () { controller.printParty() }, false)
	},
	
	printParty: function (party)
	{
		window.print()
		Statistics.partyPrinted(party)
	},
	
	guessParty: function ()
	{
		var name = this.nodes.partyName.getAttribute('data-value')
		this.controller.partyNameGuessed(name)
	}
}

Papa.View = Me

})();
