<!--# include virtual="/js/common/find-cheapest-price.js" -->

;(function(){

var myName = 'PurchasePlanTable',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
	},
	
	setState : function(data)
	{
		this.model.setState(data)
	}
}

Object.extend(Me.prototype, myProto)
Me.mixIn(EventDriven)
})();


/*View*/

eval(NodesShortcut.include())

;(function(){

var Me = PurchasePlanTable.View

var myProto =
{
	bind : function (nodes)
	{
		var me = this
		this.nodes = nodes
	},
	
	renderPlan : function(ingredients, volumes, prices, excludes, totalPrice)
	{
		if(!ingredients.length)
		{
			return
		}
		
		var wrapper = this.nodes.wrapper
		var groupName = ''
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			if(groupName != ingredient.group)
			{
				if(tr && i)
				{
					tr.addClassName('last')
				}
				groupName = ingredient.group
				var table = Nc('table', 'group-table')
				var thead = N('thead')
				var tbody = N('tbody')
				var tr = N('tr')
				var groupNameTh = Nct('th', 'item-name tr-content', groupName)
				var amountTh = Nct('th', 'item-volume tr-content', 'кол-во')
				var totalTh = Nct('th', 'item-price tr-content', '≈ руб.')
				
				tr.appendChild(groupNameTh)
				tr.appendChild(amountTh)
				tr.appendChild(totalTh)
				thead.appendChild(tr)
				
				table.appendChild(thead)
				table.appendChild(tbody)
				wrapper.appendChild(table)
			}
			
			var name = ingredient.name
			var exclude = excludes[name]
			var volume = volumes[name]
			var price = prices[name]
			
			var tr = this.renderRow(ingredient, volume, price, exclude)
			tbody.appendChild(tr)
		}
		tr.addClassName('last')
		
		this.renderTotalPrice(totalPrice)
	},
	
	renderRow : function(ingredient, volume, price, exclude)
	{
		var tr = N('tr')
		
		var nameTd = this.renderName(ingredient)
		tr.appendChild(nameTd)
		tr.edit = nameTd
		
		var volumeTd = this.renderVolume(ingredient, volume, exclude)
		tr.appendChild(volumeTd)
		tr.volume = volumeTd.volume
		
		var priceTd = this.renderPrice(price, exclude)
		tr.appendChild(priceTd)
		tr.price = priceTd
		
		return tr
	},
	
	renderName : function(ingredient)
	{
		var td = Nc('td', 'item-name tr-content')
		var name = ingredient.name
		var brand = ingredient.brand
		var link = Nct('span', 'link-to-popup', name + (brand ? ' ' + brand : ''))
		link['data-ingredient'] = ingredient
		td.appendChild(link)
		return td		
	},
	
	renderVolume : function(ingredient, volume, exclude)
	{
		var td = Nc('td', 'item-volume tr-content')
		var volume = Nct('span', 'volume-value', exclude ? 0 : volume)
		var unit = Nct('span', 'volume-unit', ingredient.unit)
		td.appendChild(volume)
		td.appendChild(unit)
		return td
	},
	
	renderPrice : function(price, exclude)
	{
		var td = Nc('td', 'item-price tr-content')
		var div = N('div')
		div.appendChild(T(exclude ? 0 : price))
		td.appendChild(div)
		return td
	},
	
	renderTotalPrice : function(totalPrice)
	{
		var totalPriceNode = this.nodes.totalPrice
		totalPriceNode.empty()
		totalPriceNode.appendChild(T(totalPrice))
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Model*/

;(function(){

var Me = PurchasePlanTable.Model

var myProto =
{
	bind : function ()
	{
		
	},
	
	setState : function(data)
	{
		this.setData(data)
		var totalPrice = this.calculateTotalPrice(this.prices, this.excludes)
		this.view.renderPlan(this.ingredients, this.volumes, this.prices, this.excludes, totalPrice)
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
			{
				totalPrice += prices[k]
			}
		}
		return Math.round(totalPrice)
	},
	
	setData : function(data)
	{
		this.volumes = this.getVolumes(data.volumes, data.ingredients)
		this.prices = this.calculatePrices(data.ingredients, this.volumes)
		this.ingredients = data.ingredients
		this.excludes = data.excludes
	},
	
	getVolumes : function(volumes, ingredients)
	{
		var v = {}
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			var name = ingredient.name
			if(!volumes[name] || isNaN(volumes[name]))
				v[name] = this.getCheapestVolume(ingredient)
			else
				v[name] = volumes[name]
		}
		
		return v
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
				rVol = v
			}
		}
		return rVol
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = PurchasePlanTable.Controller

var myProto =
{
	bind : function()
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();
