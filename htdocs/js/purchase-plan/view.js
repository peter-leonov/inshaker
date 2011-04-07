;(function(){

var Me = PurchasePlan.View
eval(NodesShortcut.include())

var myProto =
{
	initialize : function()
	{
		this.currentEditingField = null
		this.i = 0
	},
	
	bind : function (nodes)
	{
		log(nodes)
		this.nodes = nodes
		
		this.barName = new MyBarName()
		log(nodes.barName)
		this.barName.bind(nodes.barName)
		
		this.purchasePlanTable = new PurchasePlanTable()
		this.purchasePlanTable.bind(nodes.purchasePlan)
		this.purchasePlanTable.addEventListener('change', function(e){ me.controller.save(e.data) })
		
		var me = this
		
		nodes.purchasePlan.wrapper.addEventListener('click', function(e){ me.handleTableClick(e) }, false)
	},
	/*
		handleInputBlur : function(e)
		{
			var target = e.target
			if(!target.volumeInput)
				return
			
			target.row.removeClassName('active')
			
			setTimeout(function(){ target.value = parseFloat(target.value) || 0 }, 0)
			
			this.tempEditingField = target
			//log('tempEditingField', this.tempEditingField)
		},
		
		handleInputFocus : function(e)
		{
			var target = e.target
			if(!target.volumeInput)
				return	
			
			target.row.addClassName('active')
			
			var me = this
			setTimeout(function(){ me.getCursorPos(target) }, 0)
			
			//log('focus', target)
			
			if(!this.currentEditingField)
				this.currentEditingField = target
			//setTimeout(function(){ me.currentEditingField = target }, 100)
		},
		
		handleInputSelect : function(e)
		{
			var target = e.target
			if(!target.volumeInput)
				return
				
			//alert(1)
			
			if(target.volumeInput)
			{
				var me = this
				setTimeout(function(){ me.getCursorPos(target) }, 0)
			}
		},*/
	
	
	handleTableClick : function(e)
	{
		var target = e.target
		if(target.editableItem)
		{
			this.controller.editPlanItem(target.editableItem, target.exclude)
			return
		}
		
		var ingredient = target['data-ingredient']
		if(ingredient)
		{
			this.controller.ingredientSelected(ingredient)
		}
	},	
	/*
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
			
			if(this.pressedInput == target)
			{
				this.currentEditingField = target
			}
			else
			{
				target = this.tempEditingField
				this.currentEditingField = this.tempEditingField
			}
			
			setTimeout(function(){
				//log(me.currentEditingField)
				me.controller.setVolume(target.ingredient, target.value)
			}, 0)
		},*/
	
	
	renderBarName : function(barName)
	{
		this.barName.setMainState(barName)
	},
	
	renderPurchasePlan : function(ingredients, volumes, excludes)
	{
		this.purchasePlanTable.setState({ ingredients : ingredients, volumes : volumes, excludes : excludes })
	},
	
/*	renderTotalPrice : function(totalPrice)
	{
		var nodes = this.nodes.purchasePlan
		nodes.totalPrice.empty()
		nodes.totalPrice.appendChild(T(totalPrice))
	},
	
	renderNewPrice : function(price)
	{
		var tr = this.currentEditingField.row
		var editNode = this.currentEditingField.editNode
		var priceNode = this.currentEditingField.priceNode
		if(!price)
		{
			tr.removeClassName('included')
			tr.addClassName('excluded')
			editNode.exclude = true
			editNode.empty()
			editNode.appendChild(T('+'))		
		}
		else
		{
			tr.removeClassName('excluded')
			tr.addClassName('included')		
			editNode.exclude = false
			editNode.empty()
			editNode.appendChild(T('├Ч'))
		}
		
		priceNode.empty()
		priceNode.appendChild(T(price))
	},
	
	renderFilteredVolume : function(volume)
	{
		var input = this.currentEditingField
		
		input.value = volume
		
		var length = input.value.length
		
		
		var me = this
		
		setTimeout(function(){
			me.setCursorPos(input)
			me.getCursorPos(input)
		}, 0)
		
	},*/

	
	/*appendEventsToVolumeField : function(node)
		{
			var me = this
			
			var keypress = function(e)
			{
				var target = e.target
				me.currentEditingField = target
				
				//if tab press
				if(e.keyCode == 9)
				{
					return
				}
				
				//toRight and toLeft keys
				if(target.prevValue == target.value)
				{
					me.getCursorPos(target)
					return
				}
				
				//delete key
				if(e.keyCode == 46 && !e.charCode)
				{
					target.deletePress = true
				}
				
				me.controller.setVolume(target.ingredient, target.value)
			}
			
			var t = new Throttler(keypress, 100, 500)
			
			node.addEventListener('keypress', function(e){ t.call(e) }, false)
			node.addEventListener('focus', function() {	this.row.addClassName('active'); me.getCursorPos(this) }, false)
			node.addEventListener('click', function(){ me.getCursorPos(this) }, false)
			node.addEventListener('blur', function(){ this.row.removeClassName('active'); this.value = parseFloat(this.value) || 0}, false)
		},
		*/
	/*
		getCursorPos : function(input)
		{
			//var end = input.selectionEnd >= input.selectionStart ? input.selectionEnd : input.selectionStart
			//var start = input.selectionEnd >= input.selectionStart ? input.selectionEnd : input.selectionStart
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
		
		logPos : function(input)
		{
			log('selectionStart', input.selectionStart, ' | ', 'selectionEnd', input.selectionEnd, ' | ', 'selPos', input.selPos, ' | ', 'length', input.value.length)
		},
	
	renderIfEmpty : function()
		{
			this.nodes.purchasePlan.main.addClassName('empty')
		},*/
	
	
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
