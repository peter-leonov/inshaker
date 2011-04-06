<!--# include virtual="/js/common/find-cheapest-price.js" -->

;(function(){

var myName = 'PurchasePlan',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
	},
	
	setMainState : function(data)
	{
		this.model.setMainState(data)
	}
}

Object.extend(Me.prototype, myProto)

})();


/*View*/

eval(NodesShortcut.include())

;(function(){

var Me = PurchasePlan.View

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		nodes.body.addEventListener('click', function(e){ me.handleClick(e) }, false)
	},
	
	handleClick : function(e)
	{
		var target = e.target
		
		var switcher = target.parentNode
		if(switcher.editableItem)
		{
			this.currentRow = this.findRow(switcher)
			this.controller.editPlanItem(switcher.editableItem, switcher.exclude)
			return
		}
		
		var ingredient = target['data-ingredient']
		if(ingredient)
		{
			this.controller.ingredientSelected(ingredient)
		}		
	},
	
	findRow : function(target)
	{
		var node = target
		while(!node.planRow)
			node = node.parentNode
		
		return node
	},
	
	renderPlan : function(ingredients, volumes, prices, exludes, totalPrice)
	{
		if(!data.ingredients.length)
		{
			this.renderIfEmpty()
			return
		}
		
		var bodyNode = this.nodes.body
		var totalPriceNode = this.nodes.totalPrice
		var df = document.createDocumentFragment()
		var me = this
		
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			var name = ingredient.name
			var exclude = excludes[name]
			var volume = volumes[name]
			var price = prices[name]
			
			var tr = this.renderRow(ingredient, volume, price, exclude)
			tr.addClassName(i % 2 ? 'odd' : 'even')
			df.appendChild(tr)
		}
		
		bodyNode.empty()
		bodyNode.appendChild(df)
		
		this.renderTotalPrice(totalPrice)
	},
	
	renderRow : function(ingredient, volume, price, exclude)
	{
		var tr = Nc('tr', (exclude ? 'excluded' : 'included'))
		tr.planRow = true
		
		tr.appendChild(this.renderEditButton(ingredient, exclude))
		tr.appendChild(this.renderName(ingredient))
		tr.appendChild(this.renderVolume(ingredient, volume, exclude))
		tr.appendChild(this.renderPrice(price, exclude))
		
		return tr
	},
	
	renderEditButton : function(ingredient, exclude)
	{
		var td = Nc('td', 'edit-item')
		var edit = Nc('div', 'edit')
		edit.appendChild(Nct('div', 'add', '+'))
		edit.appendChild(Nct('div', 'remove', '×'))
		edit.editableItem = ingredient
		edit.exclude = exclude	
		td.edit = edit
		td.appendChild(edit)
		return td
	},
	
	renderName : function(ingredient)
	{
		var td = Nc('td', 'item-name')
		var name = ingredient.name
		var brand = ingredient.brand
		var link = Nct('span', 'link-to-popup', name + (brand ? ' ' + brand : ''))
		link['data-ingredient'] = ingredient
		td.appendChild(link)
		return td		
	},
	
	renderVolume : function(ingredient, volume, exclude)
	{
		var td = Nc('td', 'item-volume')
		var volume = Nct('div', 'volume-value', exclude ? 0 : volume)
		var unit = Nct('span', 'volume-unit', ingredient.unit)
		td.appendChild(volume)
		td.appendChild(unit)
		return td
	},
	
	renderPrice : function(price, exclude)
	{
		var td = Nct('td', 'item-price', exclude ? 0 : price)
		return td
	},
	
	renderTotalPrice : function(totalPrice)
	{
		var totalPriceNode = this.nodes.totalPrice
		totalPriceNode.empty()
		totalPriceNode.appendChild(T(totalPrice))
	},
	
	updateRow : function(ingredient, volume, price, exclude, totalPrice)
	{
		if(!this.currentRow)
			return
		
		var df = document.createDocumentFragment()
		df.appendChild(renderRow(ingredient, volume, price, exclude))
		
		this.currentRow.empty()
		this.currentRow.appendChild(df)
		this.currentRow = null
		this.renderTotalPrice(totalPrice)
	},
	
	showIngredient: function (ingredient)
	{
		if (ingredient)
		{
			var popup = IngredientPopup.show(ingredient)
			var controller = this.controller
			popup.onhide = function () { controller.ingredientSelected(null) }
		}
		else
			IngredientPopup.hide()
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Model*/

;(function(){

var Me = PurchasePlan.Model

var myProto =
{
	bind : function ()
	{
		
	},
	
	setMainState : function(data)
	{
		this.setData(data)
		var totalPrice = this.calculateTotalPrice(this.prices, data.excludes)
		this.view.renderPlan(data.ingredients, data.volumes, this.prices, data.excludes, totalPrice)
	},
	
	calculatePrices : function(ingredients, volumes)
	{
		var prices = {}
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			var name = ingredient.name
			var volume = volumes[name]
			prices[name] = findCheapestPrice(ingredient, volume).price
		}
		return prices
	},
	
	calculateTotalPrice : function(prices, excludes)
	{
		var totalPrice = 0
		for (var k in prices) 
		{
			if(!excludes[k])
				totalPrice += prices[k]
		}
		return totalPrice
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		var name = ingredient.name
		exclude = !exclude
		this.excludes[name] = exclude
		this.onChange()
		var totalPrice = this.calculateTotalPrice(this.volumes)
		this.view.updateRow(ingredient, this.volumes[name], this.prices[name], exclude, totalPrice)
	},
	
	selectIngredient : function(ingredient)
	{
		this.view.showIngredient(ingredient)
	},
	
	setData : function(data)
	{
		this.prices = this.calculatePrices(data.ingredients, data.volumes)
		this.ingredients = data.ingredients
		this.volumes = this.getVolumes(data.volumes, data.ingredients)
		this.excludes = data.excludes
	},
	
	onChange : function()
	{
		this.parent.dispatchEvent({ type : 'changed', data : { ingredients : this.ingredients, volumes : this.volumes, excludes : this.excludes } })
	},
	
	getVolumes : function(volumes, ingredients)
	{
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			var name = ingredient.name
			volumes[name] = volumes[name] || this.getCheapestVolume(ingredient)
		}
		
		return volumes
	},
	
	getCheapestVolume : function(ingredient)
	{
		var minNominal = null, rVol = null
		
		for (var i = 0, il = ingredient.volumes.length; i < il; i++) 
		{
			var volume = ingredient.volumes[i]
			var v = volume[0]
			var p = volume[1]
			var nominal = Math.round(p / v)
			if(!minNominal || nominal < minNominal)
			{
				minNominal = nominal
				rVol = { volume : v, price : p }
			}
		}
		return rVol
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = PurchasePlan.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		this.model.editPlanItem(ingredient, exclude)
	},
	
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	}	
}

Object.extend(Me.prototype, myProto)

})();
