;(function(){

var Me = PurchasePlan.View
eval(NodesShortcut.include())

var myProto =
{
	initialize : function()
	{
		this.currentEditingField = null
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		
		this.purchasePlanTable = new PurchasePlanTable()
		this.purchasePlanTable.bind(nodes)
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
	}
}

Object.extend(Me.prototype, myProto)

})();
