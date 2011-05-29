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
			me.ingredients = me.getIngredients(bar.ingredients)
			me.volumes = bar.purchasePlanVolumes
			me.excludes = bar.purchasePlanExcludes
			
			me.parent.setMainState()
		})		
	},
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderPurchasePlan(this.ingredients, this.volumes, this.excludes)
	},
	
	getIngredients : function(ingredientNames)
	{
		var ingredients = []
		ingredients.inBar = {}
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			var name = ingredientNames[i]
			var ingredient = Ingredient.getByName(name)
			if(ingredient)
			{
				ingredients.push(ingredient)
				ingredients.inBar[name] = true
			}
		}
		return ingredients.sort(function(a, b){
			if(a.group != b.group)
			{
				return Ingredient.sortByGroups(a.name, b.name)
			}
				
			return a.name.localeCompare(b.name)
		})		
	},
	
	save : function(data)
	{
		this.volumes = data.volumes
		this.excludes = data.excludes
		BarStorage.saveBar({ purchasePlanVolumes : data.volumes, purchasePlanExcludes : data.excludes })
	},
	
	selectIngredient : function(ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();
