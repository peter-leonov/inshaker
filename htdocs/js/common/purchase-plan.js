<!--# include virtual="/js/common/find-cheapest-price.js" -->

;(function(){

var myName = 'PurchasePlan',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function ()
	{
		this.view.bind()
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
			
			var tr = Nc('tr', (exclude ? 'excluded' : 'included') + ' ' + (i % 2 ? 'odd' : 'even'))
			tr.appendChild(this.renderRow(ingredient, volume, price, exclude))
			df.appendChild(tr)
		}
		
		bodyNode.empty()
		bodyNode.appendChild(df)
		
		totalPriceNode.empty()
		totalPriceNode.appendChild(T(totalPrice))
	},
	
	renderRow : function(ingredient, volume, price, exclude)
	{
		var df = document.createDocumentFragment()
		df.appendChild(this.renderEditButton(ingredient, exclude))
		df.appendChild(this.renderName(ingredient))
		df.appendChild(this.renderVolume(ingredient, volume, exclude))
		df.appendChild(this.renderPrice(price, exclude))
		
		return df
	},
	
	renderEditButton : function(ingredient, exclude)
	{
		var td = Nc('td', 'edit-item')
		var edit = Nc('div', 'edit')
		edit.appendChild(Nct('div', 'add', '+'))
		edit.appendChild(Nct('div', 'remove', '×'))
		edit.editableItem = ingredient
		edit.exclude = exclude	
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
	
/*	renderVolume : function(ingredient, volume, exclude)
	{
		var td = Nc('td', 'item-volume')
		var volume = Nc('input', 'volume-value')
		volume.value = exclude ? 0 : volume
		volume.setAttribute('type', 'text')
		volume.setAttribute('name', 'volume-value')
		volume.ingredient = ingredient
		volume.volumeInput = true
		var unit = Nct('span', 'volume-unit', ingredient.unit)
		td.appendChild(volume)
		td.appendChild(unit)
		return td
	},*/

	
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
		var prices = this.calculatePrices(data.ingredients, data.volumes)
		var totalPrice = this.calculateTotalPrice(prices, data.excludes)
		this.view.renderPlan(data.ingredients, data.volumes, prices, data.exludes, totalPrice)
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
		
	}
}

Object.extend(Me.prototype, myProto)

})();
