;(function(){

var Me = PurchasePlan.View

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
	
	renderPurchasePlan : function()
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();
