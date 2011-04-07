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
		nodes.body.addEventListener('select', function(e){ me.handleInputSelect(e) }, true)
		nodes.body.addEventListener('blur', function(e){ me.handleInputBlur(e) }, true)
		nodes.body.addEventListener('focus', function(e){ me.handleInputFocus(e) }, true)
		nodes.body.addEventListener('keyup', function(e){ me.handleInputKeyup(e) }, true)
		nodes.body.addEventListener('keypress', function(e){ me.handleInputKeypress(e) }, true)
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
		
		if(target.volumeInput)
		{
			var me = this
			setTimeout(function(){ me.getMarkerPos(target) }, 0)
		}
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
		//log('tempEditingField', this.tempEditingField)
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
	},
	
	renderVolume : function(ingredient, volume, exclude)
	{
		var td = Nc('td', 'item-volume')
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
		tr.price = priceTd
		
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
		log(priceNode)
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
		
		var me = this
		
		setTimeout(function(){
			me.setMarkerPos(input)
			me.getMarkerPos(input)
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
	}
}

Object.extend(Me.prototype, PurchasePlanTable.Controller.prototype)
Object.extend(Me.prototype, myProto)

})();
