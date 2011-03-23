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
			me.notes = bar.purchasePlanNotes
			me.volumes = bar.purchasePlanVolumes
			me.excludes = bar.purchasePlanExcludes
			
			me.parent.setMainState()
		})		
	},
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderPurchasePlan(this.ingredients, this.volumes, this.notes, this.excludes)
	},
	
	getIngredients : function()
	{
		var ingredients = []
		ingredients.inBar = {}
		ingredients.inBarNames = ingredientNames
		
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			ingredients.push(Ingredient.getByName(ingredientNames[i]))
			ingredients.inBar[ingredientNames[i]] = true
		}
		return ingredients.sort(function(a, b){
			if(a.group != b.group)
				return Ingredient.sortByGroups(a.name, b.name)
				
			return a.name.localeCompare(b.name)
		})		
	}
}

Object.extend(Me.prototype, myProto)

})();
