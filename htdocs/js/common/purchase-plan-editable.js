<!--# include virtual="/js/common/purchase-plan.js" -->

;(function(){

var myName = 'PurchasePlanEditable',
	parent = PurchasePlan,
	Me = self[myName] = function(){ parent.apply(this) }

Object.extend(Me.prototype, new PurchasePlan())

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
		nodes.purchasePlan.wrapper.addEventListener('select', function(e){ me.handleInputSelect(e) }, true)
		nodes.purchasePlan.wrapper.addEventListener('blur', function(e){ me.handleInputBlur(e) }, true)
		nodes.purchasePlan.wrapper.addEventListener('focus', function(e){ me.handleInputFocus(e) }, true)
		nodes.purchasePlan.wrapper.addEventListener('keyup', function(e){ me.handleInputKeyup(e) }, true)
		nodes.purchasePlan.wrapper.addEventListener('keypress', function(e){ me.handleInputKeypress(e) }, true)
	},
	
	handleInputBlur : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
		
		var row = findRow(target)
		row.removeClassName('active')
		
		setTimeout(function(){ target.value = parseFloat(target.value) || 0 }, 0)
		
		this.tempCurrentInput = target
		//log('tempEditingField', this.tempEditingField)
	},
	
	handleInputFocus : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return	
		
		var row = findRow(target)
		target.row.addClassName('active')
		
		var me = this
		setTimeout(function(){ me.getCursorPos(target) }, 0)
		
		if(!this.currentInput)
			this.currentInput = target
	},
	
	handleInputSelect : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
		
		if(target.volumeInput)
		{
			var me = this
			setTimeout(function(){ me.getCursorPos(target) }, 0)
		}
	},
	
	handleInputKeypress : function(e)
	{
		var target = e.target
		if(!target.volumeInput)
			return
		
		//press shift of ctrl
		if(e.keyCode == 16 || e.keyCode == 17)
		{
			this.controlKeyPress = true
			return
		}
		
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
			
		if(e.keyCode == 16 || e.keyCode == 17)
		{
			this.controlKeyPress = false
			return
		}
		
		//alert(e.keyCode + ' ' + e.charCode)
		
		//tab key
		if(e.keyCode == 9)
		{
			return
		}

		
		//copy || select all
		if(this.controlKeyPress && (e.keyCode == 67 || e.keyCode == 65))
		{
			return
		}
		
		var me = this
		var arrowKeys = { 37 : true, 39 : true }
		//toRight and toLeft keys
		if(arrowKeys[e.keyCode])
		{
			setTimeout(function(){ me.getCursorPos(target) }, 0)
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
	},
	
	renderVolume : function(ingredient, volume, exclude)
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
		td.volume = volume
		return td
	},
	
	renderRow : function(ingredient, volume, price, exclude)
	{
		var tr = Nc('tr', (exclude ? 'excluded' : 'included'))
		tr.planRow = true
		
		var editTd = this.renderEditButton(ingredient, exclude)
		tr.appendChild(editTd)
		tr.edit = editTd.edit
		
		tr.appendChild(this.renderName(ingredient))
		
		var volumeTd = this.renderVolume(ingredient, volume, exclude)
		tr.appendChild(volumeTd)
		tr.volume = volumeTd.volume
		
		var priceTd = this.renderPrice(price, exclude)
		tr.appendChild(priceTd)
		tr.price = volumeTd.volume
		
		return tr
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
	
	getCursorPos : function(input)
	{
		input.selPos = input.value.length - input.selectionEnd
		input.selPosLength = input.selectionEnd - input.selectionStart
		input.prevValue = input.value
		input.deletePress = false
	},
	
	setCursorPos : function(input)
	{
		if(input.prevValue.length == input.selPosLength)
			return
		
		this.logPos(input)
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
			editNode.exclude = true
		}
		else
		{
			tr.removeClassName('excluded')
			tr.addClassName('included')		
			editNode.exclude = false
		}
		
		priceNode.empty()
		priceNode.appendChild(T(price))
	},
	
	renderFilteredVolume : function(volume)
	{
		var input = this.currentInput
		
		input.value = volume
		
		var length = input.value.length
		
		
		var me = this
		
		setTimeout(function(){
			me.setCursorPos(input)
			me.getCursorPos(input)
		}, 0)
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
		var volumes = this.volumes = this.getVolumes(data.volumes, data.ingredients)
		var prices = this.prices = this.calculatePrices(data.ingredients, volumes)
		var totalPrice = this.calculateTotalPrice(prices, data.excludes)
		this.view.renderPlan(data.ingredients, data.volumes, prices, data.excludes, totalPrice)
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
	
	/*calculateTotalPrice : function(prices, excludes)
		{
			var totalPrice = 0
			for (var k in prices) 
			{
				if(!excludes[k])
					totalPrice += prices[k]
			}
			return totalPrice
		},*/
	
	/*
		editPlanItem : function(ingredient, exclude)
		{
			var name = ingredient.name
			exclude = !exclude
			this.excludes[name] = exclude
			this.onChange()
			var totalPrice = this.calculateTotalPrice(this.volumes)
			this.view.updateRow(ingredient, this.volumes[name], this.prices[name], exclude, totalPrice)
		}
	
*/
	
	
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
		
		this.totalPrice = this.calculateTotalPrice(this.prices, this.excludes)
		this.onChange()
		this.view.renderFilteredVolume(volumeString)
		this.view.renderNewPrice(price)
		this.view.renderTotalPrice(this.totalPrice)
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = PurchasePlan.Controller

var myProto =
{
	setVolume : function(ingredient, v)
	{
		v = v.replace(/[\,]+/g, '.').replace(/[^0-9\.]*/g, '').replace(/\.+/g, '.')
		this.model.setVolume(ingredient, v)
	}
}

Object.extend(Me.prototype, myProto)

})();
