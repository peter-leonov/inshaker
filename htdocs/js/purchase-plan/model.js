;(function(){

var Me = PurchasePlan.Model

var myProto =
{
	bind : function ()
	{
		var me = this
		BarStorage.initBar(function(bar){
			me.barName = bar.barName
			me.ingredients = me.getIngredients(bar.ingredients)
			
			me.parent.setMainState()
		})		
	},
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderPurchasePlan()
	},
	
	getIngredients : function()
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();
