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
		
		this.purchasePlanTable = new PurchasePlanTableEditable()
		this.purchasePlanTable.bind(nodes)
		this.purchasePlanTable.addEventListener('change', function(e){ me.controller.save(e.data) })
		
		var me = this
		
		nodes.wrapper.addEventListener('click', function(e){ me.handleTableClick(e) }, false)
	},

	handleTableClick : function(e)
	{
		var target = e.target
/*		if(target.editableItem)
		{
			this.controller.editPlanItem(target.editableItem, target.exclude)
			return
		}*/

		
		var ingredient = target['data-ingredient']
		if(ingredient)
		{
			this.controller.ingredientSelected(ingredient)
		}
	},	

	renderBarName : function(barName)
	{
		if(barName)
		{
			this.nodes.barName.empty()
			this.nodes.barName.appendChild(T(barName))
		}
	},
	
	renderPurchasePlan : function(ingredients, volumes, excludes)
	{
		this.purchasePlanTable.setState({ ingredients : ingredients, volumes : volumes, excludes : excludes })
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
