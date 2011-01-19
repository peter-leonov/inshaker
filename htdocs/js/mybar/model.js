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

var Papa = MyBar, Me = Papa.Model
var myProto =
{
	initialize : function()
	{
		this.ingredients = []
		this.recommends = []
	},
	
	bind : function ()
	{
		var me = this, bar = {  ingredients : [], showPhotos : true }
		Storage.init(function(){
			try
			{
				Object.extend(bar, JSON.parse(Storage.get('mybar')))
			}
			catch(e)
			{
			}
			
			me.showPhotos = bar.showPhotos
			
			me.ingredients = me.getIngredients(bar.ingredients)
			//me.recommends = me.computeRecommends( me.ingredients)
			me.cocktails = me.computeCocktails(me.ingredients)
			log(me.cocktails)	
			me.parent.setBar()
			
			var ingredients = Ingredient.getAllNames(),
				secondNames = Ingredient.getAllSecondNames(),
				secondNamesHash = Ingredient.getNameBySecondNameHash()
				
			var set = ingredients.slice()
			set.push.apply(set, secondNames)
			set.sort()
			
			var searcher = me.searcher = new IngredientsSearcher(set, secondNamesHash)
			me.view.setCompleterDataSource(searcher)
		})
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients /*, this.ingredients.inBar*/)
	},
	
	setRecommends : function()
	{
		//this.view.renderRecommends(this.recommends, this.ingredients.inBar)
	},
	
	setCocktails : function()
	{
		this.view.renderCocktails(this.cocktails, this.showPhotos)
	},
	
	getIngredients : function(ingredientNames)
	{
		var /*inBar = Array.toHash(ingredientNames), */me = this
		var ingredients = fetchIngredients(ingredientNames)
		ingredients.inBar = Array.toHash(ingredientNames)
		//ingredients.inBarNames = ingredientNames
		
		ingredients.add = function(ingredient)
		{
			if(this.inBar[ingredient.name])
				return false
			this.push(ingredient)
			this.sort(function(a,b){ return Ingredient.sortByGroups(a.name, b.name) })
			this.inBar[ingredient.name] = true
			/*
			this.inBarNames.push(ingredient.name)
			*/
			return this
		}
		
		ingredients.remove = function(ingredient)
		{
			this.inBar[ingredient.name] = null
			//this.inBarNames = Object.toArray(this.inBar)
			this.length = 0
			Object.extend(this, fetchIngredients(Object.toArray(this.inBar)))
			return this
		}
		
		function fetchIngredients(ingredientNames)
		{
			var ingredients = []
			for (var i = 0, il = ingredientNames.length; i < il; i++)
			{
				ingredients.push(Ingredient.getByName(ingredientNames[i]))
			}
			return ingredients.sort(function(a, b){ return Ingredient.sortByGroups(a.name, b.name) })
		}
		return ingredients
	},
	
	computeCocktails : function(ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		var needCocktails = Cocktail.getByIngredientNames(Object.toArray(ingredients.inBar), {count : 1}),
			cocktails = []

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
			cocktails.push(cocktail)
		}
		
		return cocktails.sort(function(a,b){
			return a.ingredients.length - b.ingredients.length
		})
	},
	/*
	computeRecommends : function(ingredients)
	{
		if(Object.isEmpty(ingredients.inBar)) return []
		var needCocktails = Cocktail.getByIngredientNames(ingredients.inBarNames, {count : 1}),
			recommends = [[],[],[]]
		ck:
		for ( var i = 0, il = needCocktails.length; i < il; i++ )
		{
			var cocktail = needCocktails[i]
			var ing = cocktail.ingredients, rl = recommends.length, r
			for (var j = 0, t = -1, jl = ing.length; j < jl; j++)
			{
				if(ingredients.inBar[ing[j][0]]) t++
				r = j - t
				if(r>2) continue ck
			}
			recommends[r].push(cocktail)
		}
		
		var groups = []
		if(recommends[0].length != 0)
			groups.push({ name : 'У тебя есть все, чтобы приготовить', cocktails : recommends[0].sort(sortByLength) })
		if(recommends[1].length != 0)
			groups.push({ name : 'Добавь один ингредиент', cocktails : recommends[1].sort(sortByLength) })
		if(recommends[2].length != 0) groups.push({ name : 'Добавь два ингредиента', cocktails : recommends[2].sort(sortByLength) })
		return groups
		
		function sortByLength(a, b)
		{
			return a.ingredients.length > b.ingredients.length ? 1 : -1
		}
	},
	*/
	saveStorage : function()
	{
		Storage.put('mybar', JSON.stringify({ 
			ingredients : Object.toArray(this.ingredients.inBar), showPhotos : this.showPhotos 
		}))
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(!this.ingredients.add(ingredient)) return
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.remove(ingredient)
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
	},
	
	switchCocktailsView : function(showPhotos)
	{
		this.showPhotos = showPhotos
		this.saveStorage()
		
		this.view.renderCocktails(this.cocktails, showPhotos)
	}
}
Object.extend(Me.prototype, myProto)
})();
