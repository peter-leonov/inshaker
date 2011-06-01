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
	},
	
	findRow : function(target)
	{
		var node = target
		while(!node.planRow)
			node = node.parentNode
		
		return node
	},
	
	renderPlan : function(ingredients, volumes, prices, excludes, totalPrice)
	{
		if(!ingredients.length)
		{
			this.renderIfEmpty()
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
				var trHead = Nc('th', 'tr-padding')
				var groupNameTh = Nct('th', 'item-name tr-content', groupName)
				var amountTh = Nct('th', 'item-volume tr-content', 'Кол-во')
				var totalTh = Nct('th', 'item-price tr-content', '~ Руб.')
				var trTail = Nc('th', 'tr-padding')
				
				tr.appendChild(trHead)
				tr.appendChild(groupNameTh)
				tr.appendChild(amountTh)
				tr.appendChild(totalTh)
				tr.appendChild(trTail)
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
		tr.planRow = true	
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
		var td = Nct('td', 'item-price tr-content', exclude ? 0 : price)
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
		var newRow = this.renderRow(ingredient, volume, price, exclude)
		var parent = this.currentRow.parentNode
		if(this.currentRow.hasClassName('last'))
		{
			newRow.addClassName('last')
		}
		parent.insertBefore(newRow, this.currentRow)	
		parent.removeChild(this.currentRow)
		this.renderTotalPrice(totalPrice)
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
				totalPrice += prices[k]
		}
		return Math.round(totalPrice)
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		var name = ingredient.name
		exclude = !exclude
		this.excludes[name] = exclude
		this.onChange()
		var totalPrice = this.calculateTotalPrice(this.prices, this.excludes)
		this.view.updateRow(ingredient, this.volumes[name], this.prices[name], exclude, totalPrice)
	},
	
	setData : function(data)
	{
		this.volumes = this.getVolumes(data.volumes, data.ingredients)
		this.prices = this.calculatePrices(data.ingredients, this.volumes)
		this.ingredients = data.ingredients
		this.excludes = data.excludes
	},
	
	onChange : function()
	{
		this.parent.dispatchEvent({ type : 'change', data : { ingredients : this.ingredients, volumes : this.volumes, excludes : this.excludes } })
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
		
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		this.model.editPlanItem(ingredient, exclude)
	}
}

Object.extend(Me.prototype, myProto)

})();
