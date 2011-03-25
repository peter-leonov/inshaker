;(function(){

var Me = PurchasePlan.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		this.model.editPlanItem(ingredient, exclude)
	}
}

Object.extend(Me.prototype, myProto)

})();
