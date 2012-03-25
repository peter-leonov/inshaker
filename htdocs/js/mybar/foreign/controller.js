;(function(){

var Me = Foreign.Controller

var myProto =
{
	bind : function()
	{
		
	},
	
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();
