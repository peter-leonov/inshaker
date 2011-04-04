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
	},
	
	setVolume : function(ingredient, v)
	{
		v = v.replace(/[\,]+/g, '.').replace(/[^0-9\.]*/g, '').replace(/\.+/g, '.')
		this.model.setVolume(ingredient, v)
	},
	/*
		setNotice : function(ingredient, notice)
		{
			this.model.setNotice(ingredient, notice)
		},
		*/
	
/*	reRender : function()
	{
		this.model.setPurchasePlan()
	},*/

	
	ingredientSelected : function(ingredient)
	{
		this.model.selectIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();
