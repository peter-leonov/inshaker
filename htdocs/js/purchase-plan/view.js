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
			var tr = Nc('tr', exclude ? 'excluded' : 'included')
			
			//edit item
			{
				var editTd = Nc('td', 'edit-item')
				var edit = Nc('div', 'edit')
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
				var volume = Nct('span', 'volume-value', volumes[name].volume)
				volume.volumeIngredient = ingredient
				var unit = Nct('span', 'volume-unit', ingredient.unit)
				volumeTd.appendChild(volume)
				volumeTd.appendChild(unit)
				
				tr.appendChild(volumeTd)
			}
			
			//item price
			{
				var priceTd = Nct('td', 'item-price', volumes[name].price)
				tr.appendChild(priceTd)
			}
			
			//item notice
			{
				var noticeTd = Nc('td', 'item-notice')
				var notice = Nct('span', 'notice-text', notes[name] || '')
				notice.noticeIngredient = ingredient
				
				noticeTd.appendChild(notice)
				tr.appendChild(noticeTd)
			}
			
			df.appendChild(tr)
		}
		
		//total
		{
			var tr = Nc('tr', 'total-price')
			var td = N('td')
			td.setAttribute('colspan', 2)
			
			var totalLabel = Nct('td', 'total-label', 'Итого')
			var total = Nct('td', 'total', totalPrice)
			total.setAttribute('colspan', 2)
			
			tr.appendChild(td)
			tr.appendChild(totalLabel)
			tr.appendChild(total)
			
			df.appendChild(tr)
		}
		
		var nodes = this.nodes.purchasePlan
		
		nodes.main.removeClassName('empty')
		nodes.body.empty()
		nodes.body.appendChild(df)
		
	},
	
	renderIfEmpty : function()
	{
		this.nodes.purchasePlan.main.addClassName('empty')
	}
}

Object.extend(Me.prototype, myProto)

})();
