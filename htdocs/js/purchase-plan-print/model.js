;(function(){

var Me = PurchasePlan.Model

var myProto =
{
	initialize : function()
	{
		var me = this
		
		var addIngredient = BarStorage.addIngredient
		
		BarStorage.addIngredient = function(ingredientName)
		{
			var r = addIngredient.call(BarStorage, ingredientName)
			me.ingredients = me.getIngredients(BarStorage.bar.ingredients)
			me.view.renderPurchasePlan(me.ingredients, me.volumes, me.excludes)
			return r
		}
		
		var removeIngredient = BarStorage.removeIngredient
		
		BarStorage.removeIngredient = function(ingredientName)
		{
			var r = removeIngredient.call(BarStorage, ingredientName)
			me.ingredients = me.getIngredients(BarStorage.bar.ingredients)
			me.view.renderPurchasePlan(me.ingredients, me.volumes, me.excludes)
			return r
		}
	},
	
	bind : function ()
	{
		var me = this
		BarStorage.initBar(function(bar){
			me.barName = bar.barName
			me.excludes = bar.purchasePlanExcludes
			me.ingredients = me.getIngredients(bar.ingredients, bar.purchasePlanExcludes)
			me.volumes = bar.purchasePlanVolumes
			
			me.parent.setMainState()
		})		
	},
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderPurchasePlan(this.ingredients, this.volumes, this.excludes)
	},
	
	getIngredients : function(ingredientNames, excludes)
	{
		var ingredients = []
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			var name = ingredientNames[i]
			var ingredient = Ingredient.getByName(name)
			if(ingredient && !excludes[name])
			{
				ingredients.push(ingredient)
			}
		}
		return ingredients.sort(function(a, b){
			if(a.group != b.group)
			{
				return Ingredient.compareByGroup(a, b)
			}
				
			return a.name.localeCompare(b.name)
		})		
	}
}

Object.extend(Me.prototype, myProto)

})();
