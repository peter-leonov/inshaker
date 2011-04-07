;(function(){

var Me = PurchasePlan.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	save : function(data)
	{
		this.model.save(data)
	},
	
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();
