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
		this.nodes = nodes
		
		this.barName = new MyBarName()
		this.barName.bind(nodes.barName)
		
		var me = this
		
		nodes.purchasePlan.wrapper.addEventListener('click', function(e){ me.handleTableClicks(e) }, false)
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
		
		target.row.removeClassName('active')
		
		setTimeout(function(){ target.value = parseFloat(target.value) || 0 }, 0)
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
			
		setTimeout(function(){ me.currentEditingField = target }, 100)
	},
	
	handleTableClicks : function(e)
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
		
		if(target.volumeInput)
		{
			var me = this
			this.currentEditingField = target
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
		
		if(this.pressedInput == target)
		{
			this.currentEditingField = target
		}
		else
		{
			target = this.currentEditingField
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
		
		
		setTimeout(function(){
			//log(me.currentEditingField)
			me.controller.setVolume(target.ingredient, target.value)
			me.currentEditingField = e.target
		}, 0)
	},
	
	renderBarName : function(barName)
	{
		this.barName.setMainState(barName)
	},
	
	renderPurchasePlan : function(ingredients, volumes, notes, excludes, totalPrice)
	{
		if(!ingredients.length)
		{
			this.renderIfEmpty()
			return
		}
		
		var bodyNode = this.nodes.purchasePlan.body
		var df = document.createDocumentFragment()
		var me = this
		
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			(function(){
			var ingredient = ingredients[i]
			var name = ingredient.name
			
			exclude = excludes[name]
			var tr = Nc('tr', (exclude ? 'excluded' : 'included') + ' ' + (i % 2 ? 'odd' : 'even'))
			
			//edit item
			{
				var editTd = Nc('td', 'edit-item')
				var edit = Nct('div', 'edit', exclude ? '+' : '×')
				edit.editableItem = ingredient
				edit.exclude = exclude
				
				editTd.appendChild(edit)
				
				tr.appendChild(editTd)
			}
			
			//item name
			{
				var nameTd = Nc('td', 'item-name')
				var brand = ingredient.brand
				var link = Nct('span', 'link-to-popup', name + (brand ? ' ' + brand : ''))
				link['data-ingredient'] = ingredient
				nameTd.appendChild(link)
				tr.appendChild(nameTd)
			}
			
			//item volume
			{
				var volumeTd = Nc('td', 'item-volume')
				var volume = Nc('input', 'volume-value')
				volume.value = exclude ? 0 : volumes[name].volume
				//if(!exclude)
				{
					volume.setAttribute('type', 'text')
					volume.setAttribute('name', 'volume-value')
					volume.ingredient = ingredient
					volume.row = tr
					volume.volumeInput = true
					volume.editNode = edit
				}
				var unit = Nct('span', 'volume-unit', ingredient.unit)
				volumeTd.appendChild(volume)
				volumeTd.appendChild(unit)
				
				tr.appendChild(volumeTd)
			}
			
			//item price
			{
				var priceTd = Nct('td', 'item-price', exclude ? 0 : volumes[name].price)
				volume.priceNode = priceTd
				tr.appendChild(priceTd)
			}
			
			/*//item notice
						{
							var noticeTd = Nc('td', 'item-notice')
							var notice = Nct('div', 'notice-text', notes[name] || '')
							notice.setAttribute('contenteditable', true)
							notice.ingredient = ingredient
							this.appendEventsToNoticeField(notice)
			
				noticeTd.appendChild(notice)
							tr.appendChild(noticeTd)
						}*/
			
			
			df.appendChild(tr)
			})()
		}
		
		//total
		
		var nodes = this.nodes.purchasePlan
		
		nodes.main.removeClassName('empty')
		nodes.body.empty()
		nodes.body.appendChild(df)
		
		this.renderTotalPrice(totalPrice)
		
	},
	
	renderTotalPrice : function(totalPrice)
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
			editNode.appendChild(T('×'))
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
		
	},
	
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
	
	logPos : function(input)
	{
		log('selectionStart', input.selectionStart, ' | ', 'selectionEnd', input.selectionEnd, ' | ', 'selPos', input.selPos, ' | ', 'length', input.value.length)
	},

	renderIfEmpty : function()
	{
		this.nodes.purchasePlan.main.addClassName('empty')
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
