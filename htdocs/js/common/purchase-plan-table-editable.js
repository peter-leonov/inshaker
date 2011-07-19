<!--# include virtual="/js/common/purchase-plan-table.js" -->

;(function(){

var myName = 'PurchasePlanTableEditable',
	parent = PurchasePlanTable,
	Me = self[myName] = MVC.create()

Object.extend(Me.prototype, new PurchasePlanTable())

})();


/*View*/

eval(NodesShortcut.include())

;(function(){

var Me = PurchasePlanTableEditable.View

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		var me = this
		nodes.wrapper.addEventListener('select', function(e){ me.handleInputSelect(e) }, true)
		nodes.wrapper.addEventListener('blur', function(e){ me.handleInputBlur(e) }, true)
		nodes.wrapper.addEventListener('focus', function(e){ me.handleInputFocus(e) }, true)
		nodes.wrapper.addEventListener('keyup', function(e){ me.handleInputKeyup(e) }, true)
		nodes.wrapper.addEventListener('keypress', function(e){ me.handleInputKeypress(e) }, true)
		nodes.wrapper.addEventListener('click', function(e){ me.handleClick(e) }, false)
	},
	
	handleClick : function(e)
	{
		var node = e.target
		if(node.editableItem)
		{
			this.currentRow = this.findRow(node)
			this.controller.editPlanItem(node.editableItem, this.currentRow.hasClassName('excluded'))
			return
		}
		
		if(node.volumeInput)
		{
			var me = this
			setTimeout(function(){ me.getMarkerPos(node) }, 0)
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
				var amountTh = Nct('th', 'item-volume tr-content', 'кол-во')
				var totalTh = Nct('th', 'item-price tr-content', '≈ руб.')
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
	
	renderVolume : function(ingredient, volume, exclude)
	{
		var td = Nc('td', 'item-volume tr-content')
		var input = Nc('input', 'volume-value')
		input.value = exclude ? 0 : volume
		input.setAttribute('type', 'text')
		input.setAttribute('name', 'volume-value')
		input.ingredient = ingredient
		input.volumeInput = true
		var unit = Nct('span', 'volume-unit', ingredient.unit)
		td.appendChild(input)
		td.appendChild(unit)
		td.volume = input
		return td
	},
	
	renderName : function(ingredient)
	{
		var td = Nc('td', 'item-name tr-content')
		var wrapper = Nc('div', 'name-wrapper')
		var name = ingredient.name
		var brand = ingredient.brand
		var link = Nct('span', 'link-to-popup', name + (brand ? ' ' + brand : ''))
		var editItem = Nc('div', 'edit-item')
		editItem.editableItem = ingredient
		link['data-ingredient'] = ingredient
		wrapper.appendChild(editItem)
		wrapper.appendChild(link)
		td.appendChild(wrapper)	
		return td			
	},
	
	renderRow : function(ingredient, volume, price, exclude)
	{
		var tr = Nc('tr', (exclude ? 'excluded' : 'included'))
		tr.planRow = true
		
		var trHead = Nc('td', 'tr-padding')
		tr.appendChild(trHead)
		
		var nameTd = this.renderName(ingredient)
		tr.appendChild(nameTd)
		tr.edit = nameTd
		
		var volumeTd = this.renderVolume(ingredient, volume, exclude)
		tr.appendChild(volumeTd)
		tr.volume = volumeTd.volume
		
		var priceTd = this.renderPrice(price, exclude)
		tr.appendChild(priceTd)
		tr.price = priceTd
		
		var trTail = Nc('td', 'tr-padding')
		tr.appendChild(trTail)
		
		return tr
	},
	
	getMarkerPos : function(input)
	{
		input.selPos = input.value.length - input.selectionEnd
		input.selPosLength = input.selectionEnd - input.selectionStart
		input.prevValue = input.value
		input.deletePress = false
	},
	
	setMarkerPos : function(input)
	{
		if(input.prevValue.length == input.selPosLength)
			return
		
		var value = input.value
		var pos = value.length - input.selPos + !!(input.deletePress && !input.selPosLength)
		if(pos < 0 && value.length <= input.selPosLength)
			pos = value.length
		
		input.selectionStart = pos
		input.selectionEnd = pos
	},
	
	renderNewPrice : function(price)
	{
		var tr = this.findRow(this.currentInput)
		var editNode = tr.edit
		var priceNode = tr.price
		
		if(!price)
		{
			tr.removeClassName('included')
			tr.addClassName('excluded')
		}
		else
		{
			tr.removeClassName('excluded')
			tr.addClassName('included')
		}
		
		var div = N('div')
		div.appendChild(T(price))
		priceNode.empty()
		priceNode.appendChild(div)
	},
	
	renderFilteredVolume : function(volume)
	{
		var input = this.currentInput
		
		input.value = volume
		
		var me = this
		
		setTimeout(function(){
			me.setMarkerPos(input)
			me.getMarkerPos(input)
		}, 0)
	},
	
	updateRow : function(ingredient, volume, price, exclude, totalPrice)
	{
		if(!this.currentRow)
		{
			return
		}
		var newRow = this.renderRow(ingredient, volume, price, exclude)
		var parent = this.currentRow.parentNode
		if(this.currentRow.hasClassName('last'))
		{
			newRow.addClassName('last')
		}
		parent.insertBefore(newRow, this.currentRow)	
		parent.removeChild(this.currentRow)
		this.renderTotalPrice(totalPrice)
	},
	
	handleInputBlur : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
			
		var row = this.findRow(target)
		row.removeClassName('active')
		
		setTimeout(function(){ target.value = parseFloat(target.value) || 0 }, 0)
		
		this.tempCurrentInput = target
	},
	
	handleInputFocus : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return	
			
		var row = this.findRow(target)
		row.addClassName('active')
			
		var me = this
		setTimeout(function(){ me.getMarkerPos(target) }, 0)
		
		if(!this.currentInput)
			this.currentInput = target
	},
	
	handleInputSelect : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
		
		var me = this
		setTimeout(function(){ me.getMarkerPos(target) }, 0)
	},
	
	handleInputKeypress : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
		
		if(e.keyCode == 9)
		{
			return
		}	
		
		this.pressedInput = target
	},
	
	handleInputKeyup : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
		
		
		var controlKeys = { 17 : 'ctrl', 16 : 'shift', 9 : 'tab', 18 : 'alt' }
		
		if(controlKeys[e.keyCode])
		{
			return
		}
		
		//ctrl-c
		if(e.ctrlKey && e.keyCode == 67)
		{
			return
		}
		
		//log(e)
		var me = this
		var arrowKeys = { 35 : 'end', 36 : 'home', 37 : 'left', 38 : 'up', 39 : 'right', 40 : 'down' }
		if(arrowKeys[e.keyCode])
		{
			setTimeout(function(){ me.getMarkerPos(target) }, 0)
			return
		}
		
		//delete key
		if(e.keyCode == 46 && !e.charCode)
		{
			target.deletePress = true
		}
		
		if(this.pressedInput != target)
		{
			target = this.tempCurrentInput
		}
		
		this.currentInput = target
		
		setTimeout(function(){
			me.controller.setVolume(target.ingredient, target.value)
		}, 0)
	}
}

Object.extend(Me.prototype, PurchasePlanTable.View.prototype)
Object.extend(Me.prototype, myProto)

})();


/*Model*/

;(function(){

var Me = PurchasePlanTableEditable.Model

var myProto =
{
	setVolume : function(ingredient, volumeString)
	{
		var name = ingredient.name
		var v = parseFloat(volumeString)
		
		if(v)
		{
			this.excludes[name] = null
			this.volumes[name] = v
			var price = this.prices[name] = findCheapestPrice(ingredient, v).price
		}
		else
		{
			this.excludes[name] = true
			var price = 0
		}
		
		this.onChange()
		
		this.totalPrice = this.calculateTotalPrice(this.prices, this.excludes)
		this.view.renderFilteredVolume(volumeString)
		this.view.renderNewPrice(price)
		this.view.renderTotalPrice(this.totalPrice)
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
	
	onChange : function()
	{
		this.parent.dispatchEvent({ type : 'change', data : { ingredients : this.ingredients, volumes : this.volumes, excludes : this.excludes } })
	}
}

Object.extend(Me.prototype, PurchasePlanTable.Model.prototype)
Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = PurchasePlanTableEditable.Controller

var myProto =
{
	setVolume : function(ingredient, v)
	{
		v = v.replace(/[\,]+/g, '.').replace(/[^0-9\.]*/g, '').replace(/\.+/g, '.')
		this.model.setVolume(ingredient, v)
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		this.model.editPlanItem(ingredient, exclude)
	}
}

Object.extend(Me.prototype, PurchasePlanTable.Controller.prototype)
Object.extend(Me.prototype, myProto)

})();
