;(function(){

var Me = PurchasePlan.View
eval(NodesShortcut.include())

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		
		this.barName = new MyBarName()
		this.barName.bind(nodes.barName)
		
		var me = this
		
		nodes.purchasePlan.wrapper.addEventListener('click', function(e){ me.handleTableClicks(e) }, false)
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
		
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
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
				var link = Nct('span', 'link-to-popup', name)
				link['data-ingredient'] = ingredient
				nameTd.appendChild(link)
				tr.appendChild(nameTd)
			}
			
			//item volume
			{
				var volumeTd = Nc('td', 'item-volume')
				var volume = Nct('span', 'volume-value', exclude ? 0 : volumes[name].volume)
				//if(!exclude)
				{
					volume.setAttribute('contenteditable', true)
					volume.ingredient = ingredient
					volume.row = tr
					volume.editNode = edit
					this.appendEventsToVolumeField(volume)
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
			
			//item notice
			{
				var noticeTd = Nc('td', 'item-notice')
				var notice = Nct('div', 'notice-text', notes[name] || '')
				notice.setAttribute('contenteditable', true)
				notice.ingredient = ingredient
				this.appendEventsToNoticeField(notice)

				noticeTd.appendChild(notice)
				tr.appendChild(noticeTd)
			}
			
			df.appendChild(tr)
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
	
	currentEditingField : null,
	
	appendEventsToVolumeField : function(node)
	{
		var me = this
		var availableCharCodes = { 48:1, 49:1, 50:1, 51:1, 52:1, 53:1, 54:1, 55:1, 56:1, 57:1, 46:1, 44:1 }
		var availableKeyCodes = { 8:1, 37:1, 39:1 }
		var keypress = function(e)
		{
			var charCode = e.charCode
			var keyCode = e.keyCode
			
			
			if(keyCode == 13)
			{
				e.target.blur()
				e.preventDefault()
				return
			}
			
			if(!availableCharCodes[charCode] && !availableKeyCodes[keyCode])
			{
				e.preventDefault()
				return
			}
			
			var target = e.target
			me.currentEditingField = target
			var ingredient = target.ingredient
			setTimeout(function(){ me.controller.setVolume(ingredient, target.innerHTML) }, 0)
		}
		
		node.addEventListener('keypress', function(e){ keypress(e) }, false)
		node.addEventListener('blur', function(){ me.controller.reRender() }, false)
	},
	
	appendEventsToNoticeField : function(node)
	{
		var me = this
		var suppressKeys = { 9:1, 16:1, 17:1, 27:1, 33:1, 34:1, 35:1, 36:1, 37:1, 38:1, 39:1, 18:1, 91:1 }
		var keypress = function(e)
		{
			var charCode = e.charCode
			
			if(charCode == 13)
			{
				e.target.blur()
				e.preventDefault()
				return
			}
			if(suppressKeys[charCode])
			{
				e.preventDefault()
				return
			}
			
			var target = e.target
			var ingredient = target.ingredient
			setTimeout(function(){ me.controller.setNotice(ingredient, target.innerHTML) }, 0)
		}
		
		node.addEventListener('keypress', function(e){ keypress(e) }, false)	
	},
	
	handleTableClicks : function(e)
	{
		var target = e.target
		if(target.editableItem)
		{
			this.controller.editPlanItem(target.editableItem, target.exclude)
		}
	},	
	
	renderIfEmpty : function()
	{
		this.nodes.purchasePlan.main.addClassName('empty')
	}
}

Object.extend(Me.prototype, myProto)

})();
