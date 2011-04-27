;(function(){

Array.toHash = function(arr)
{
	var hash = {}
	for (var i = 0, il = arr.length; i < il; i++)
		hash[arr[i]] = true
	return hash
}

Object.toArray = function(obj)
{
	var arr = []
	for( var k in obj )
		if(obj[k])
			arr.push(k)
	return arr
}

var Me = Foreign.Model

var myProto =
{
	bind : function ()
	{
		var me = this
		
		function getForeignBar(userid)
		{
			if(!userid)
			{
				me.view.renderIfFail(me.newbie)
				return
			}
			
			var remoteServer = 'http://' + window.location.hostname + '/get-bar-by-id/'
			Request.get(remoteServer + userid, null, function(e){
				if(e.type != 'success')
					me.view.renderIfFail(me.newbie)
				
				me.setBar(JSON.parse(this.responseText))
			})
		}
		
		var userid = window.location.hash.substr(1)
		
		BarStorage.initBar(function(bar, newbie){ me.newbie = newbie; getForeignBar(userid) })
	},

	setBar : function(bar)
	{
		this.barName = bar.barName
		this.ingredients = this.getIngredients(bar.ingredients)
		this.cocktails = this.computeCocktails(this.ingredients)
		
		var me = this
		this.ingredients.sort(function(a,b){ return me.sortByUsage(a,b) })
		
		this.parent.setMainState()	
	},

	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderLinkToMyBar(this.newbie)
		this.view.renderIngredients(this.ingredients)
		this.view.renderCocktails(this.cocktails)
	},
	
	sortByUsage : function(a, b)
	{
		if(a.group != b.group)
			return Ingredient.sortByGroups(a.name, b.name)

		var u = this.ingredients.usage
		
		var r = (u[b.name] || 0) - (u[a.name] || 0)

		return r != 0 ? r : a.name.localeCompare(b.name)
	},
	
	getIngredients : function(ingredientNames)
	{
		var ingredients = []
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			ingredients.push(Ingredient.getByName(ingredientNames[i]))
		}
		
		ingredients.inBar = Array.toHash(ingredientNames)
		return ingredients.sort(function(a, b){ return Ingredient.sortByGroups(a.name, b.name) })
	},
	
	computeCocktails : function(ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		var needCocktails = Cocktail.getByIngredientNames(Object.toArray(ingredients.inBar), {count : 1}),
			cocktails = []
			
		ingredients.usage = {}

		ck:
		for ( var i = 0, il = needCocktails.length; i < il; i++ )
		{
			var cocktail = needCocktails[i]
			var ing = cocktail.ingredients
			for (var j = 0, jl = ing.length; j < jl; j++)
			{
				if(!ingredients.inBar[ing[j][0]]) 
					continue ck
			}

			for (var k = 0, kl = ing.length; k < kl; k++) 
			{
				var ingr = ing[k][0]
				if(!ingredients.usage[ingr])
					ingredients.usage[ingr] = 1
				else
					ingredients.usage[ingr]++
			}
			
			cocktails.push(cocktail)
		}
		
		return cocktails.sort(this.sortCocktails)
	},
	
	sortCocktails : function(a, b)
	{	
		var t = a.ingredients.length - b.ingredients.length
		if(t)
			return t
		
		var ai = a.ingredients,
			bi = b.ingredients,
			al = ai.length,
			bl = bi.length,
			lc = 0
		
		for (var i = 0, il = al < bl ? al : bl; i < il; i++) 
		{
			var aa = Ingredient.getByName(ai[i][0]),
				bb = Ingredient.getByName(bi[i][0])
			
			if(aa.group != bb.group)
				return Ingredient.sortByGroups(aa.name, bb.name)

			lc = aa.name.localeCompare(bb.name)
			if(lc)
				return lc
		}
		return lc
	},
	
	selectIngredient : function(ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();