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
			me.volumes = me.getVolumes(bar.purchasePlanVolumes)
			me.excludes = bar.purchasePlanExcludes
			
			me.totalPrice = me.calculateTotalPrice(me.volumes)
			
			me.parent.setMainState()
		})		
	},
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderPurchasePlan(this.ingredients, this.volumes, this.notes, this.excludes, this.totalPrice)
	},
	
	getIngredients : function(ingredientNames)
	{
		var ingredients = []
		
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			ingredients.push(Ingredient.getByName(ingredientNames[i]))
		}
		return ingredients.sort(function(a, b){
			if(a.group != b.group)
				return Ingredient.sortByGroups(a.name, b.name)
				
			return a.name.localeCompare(b.name)
		})		
	},
	
	getVolumes : function(volumes)
	{
		for (var i = 0, il = this.ingredients.length; i < il; i++) 
		{
			var ingredient = this.ingredients[i]
			var name = ingredient.name
			volumes[name] = volumes[name] || this.getCheapestVolume(ingredient)
		}
		
		return volumes
	},
	
	getCheapestVolume : function(ingredient)
	{
		var minNominal = null, rVol = null
		
		for (var i = 0, il = ingredient.volumes.length; i < il; i++) 
		{
			var volume = ingredient.volumes[i]
			var v = volume[0]
			var p = volume[1]
			var nominal = Math.round(p / v)
			if(!minNominal || nominal < minNominal)
			{
				minNominal = nominal
				rVol = { volume : v, price : p }
			}
		}
		return rVol
	},
	
	setVolume : function(ingredient, v)
	{
		var name = ingredient.name
		this.volumes[name] = { volume : v, price : this.findCheapestPrice(ingredient, v)}
		this.save()
	},	
	
	findCheapestPrice : function(ingredient, v)
	{		
		var ingredientVolumes = ingredient.volumes
		ingredientVolumes.map(function(a){ a.nominalPrice = a[1]/a[0] })
		ingredientVolumes.sort(function(a, b){ return a.nominalPrice - b.nominalPrice })
		
		var bottleVolume = ingredientVolumes[0][0]
		var bottles = Math.ceil(v / bottleVolume)
		var pricePerBottle = ingredientVolumes[0][1]
		var volume = bottles * bottleVolume
		var totalPrice = bottles * pricePerBottle
		var minPrice = totalPrice
		
		appendBottles(volume, minPrice, 0, [], bottles)
	
		function appendBottles(currentVolume, currentPrice, start, bottles, addingBottles)
		{
			for (var i = start, il = ingredientVolumes.length; i < il; i++) 
			{
				var volumeObj = ingredientVolumes[i]
				var vol = currentVolume
				var tbottles = addingBottles
				var temporyPrice = currentPrice
				
				while(i !=  0 && tbottles > 0 && v - vol < volumeObj[0])
				{
					vol -= bottleVolume
					tbottles--
					temporyPrice -= pricePerBottle
				}
				
				var tprice = temporyPrice + volumeObj[1]
				
				
				if(tprice < minPrice)
				{
					var currBottles = bottles.slice()
					currBottles.push(volumeObj)
					var tvol = vol + volumeObj[0]
					
					if(tvol < v)
					{
						appendBottles(tvol, tprice, i, currBottles, tbottles)
					}
					else
					{
						minPrice = tprice
					}
				}
			}
		}
		return minPrice
	},
	
	calculateTotalPrice : function(volumes)
	{
		var price = 0
		for (var k in volumes) 
		{
			price += volumes[k].price
		}
		
		return price
	},
	
	editPlanItem : function(ingredient, exclude)
	{
		this.excludes[ingredient.name] = !exclude
		this.save()
		this.view.renderPurchasePlan(this.ingredients, this.volumes, this.notes, this.excludes, this.totalPrice)
	},
	
	save : function()
	{
		BarStorage.saveBar({ purchasePlanNotes : this.notes, purchasePlanVolumes :this.volumes, purchasePlanExcludes : this.excludes })
	}
	
	
}

Object.extend(Me.prototype, myProto)

})();
