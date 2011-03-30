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
		this.model.setVolume(ingredient, v.replace(/[\.\,]+/, '.').replace(/[^0-9\.]+/, ''))
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
