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
		this.recommIngr = []
	},
	
	bind : function ()
	{
		var me = this, bar = {  ingredients : [], showPhotos : true, barName : '' }
		Storage.init(function(){
			try
			{
				Object.extend(bar, JSON.parse(Storage.get('mybar')))
			}
			catch(e)
			{
			}
			
			
			me.showPhotos = bar.showPhotos
			me.barName = bar.barName
			
			me.ingredients = me.getIngredients(bar.ingredients)
			//me.recommends = me.computeRecommends( me.ingredients)
			me.cocktails = me.computeCocktails(me.ingredients)
			me.ingredients.sort(function(a ,b){ return me.sortByUsage(a, b) })

			me.recommGroups = <!--# include virtual="/db/mybar/ingredients.js" -->
			me.recommIngr = me.computeRecommIngr(me.recommGroups)
			
			me.parent.setBar()
			
			//ingr searcher
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
	
	sortByUsage : function(a, b)
	{
		if(a.group != b.group)
			return 0
		
		var u = this.ingredients.usage

		return (u[b.name] || 0) - (u[a.name] || 0)
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
	
	setRecommIngr : function()
	{
		this.view.renderRecommBlocks(this.recommIngr)
	},
	
	setBarName : function()
	{
		this.view.renderBarName(this.barName)
	},
	
	getBarName : function()
	{
		return this.barName
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
		

		return cocktails.sort(function(a,b){
			return a.ingredients.length - b.ingredients.length
		})
	},
	
	computeRecommIngr : function(recommGroups)
	{
		var cocktails = Cocktail.getAll(),
			ingHash = this.ingredients.inBar,
			cocktailsHash = Array.toHash(this.cocktails.map(function(a){ return a.name })),
			rih = this.cAllRecommIngrHash(recommGroups),
			bo = {} //bottom output
			this.bottomOutput = bo

		ck:
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cocktail = cocktails[i]

			if(cocktailsHash[cocktail.name])
				continue

			var set = cocktail.ingredients
			var t = [], a = -1, oi = null

			for (var j = 0, jl = set.length; j < jl; j++) 
			{
				var item = set[j][0]

				if(!ingHash[item])
				{
					if(rih[item])
						t.push(item)
					
					//collect items for bottom output
					oi = item
					
					a++
				}

				//if (a>3) continue ck
			}
			
			if(a + t.length == jl)
				continue
			
			if(a == 0)
			{
				if(!bo[oi])
					bo[oi] = []
				
				bo[oi].push(cocktail)
			}
			//
				
			for (var k = 0, kl = t.length; k < kl; k++) 
			{
				var item = rih[t[k]]
				if(!item['weight'])
					item['weight'] = []
				
				if(!item['weight'][a])
					item['weight'][a] = 1
				else
					item['weight'][a]++
			}
		}
		
		//brake on groups
		groups = {}
		for (var k in rih) 
		{
			if(this.ingredients.inBar[k]) continue

			var item = rih[k]
			var	g = item.group

			if(!groups[g])
				groups[g] = []
			
			groups[g].push({ name : k, weight : item.weight })
		}
		
		//sort
		for (var k in groups) 
		{
			var group = groups[k]
			group.sort(function(a,b) { return megasort(a,b) } )
			
			log(group)
			
			var g = []
			for (var i = 0, il = group.length; i < il; i++)
			{
				var item = Ingredient.getByName(group[i].name)
				if(item) g.push(item)
			}
			groups[k] = g
		}
		
		function megasort(a, b)
		{
			var aw = a.weight || [],
				bw = b.weight || [],
				l = aw.length > bw.length ? aw.length : bw.length
			
			for (var i = 0; i < l; i++) 
			{
				aw[i] = aw[i] || 0
				bw[i] = bw[i] || 0
				if (aw[i] == bw[i])
					continue
				
				return bw[i] - aw[i]
			}
			
			if(Ingredient.getByName(a.name) && Ingredient.getByName(b.name))
				return Ingredient.sortByGroups(a.name, b.name)
			
			return 0
		}

		return groups
	},
	
	cAllRecommIngrHash : function(groups)
	{
		var rih = {}
		for (var k in groups) 
		{
			var group = groups[k]
			for (var j = 0, jl = group.length; j < jl; j++) 
			{
				rih[group[j]] = { group : k }
			}
		}
		return rih		
	},
	
	bottomOutput2Array : function(bottomOutput, sortType)
	{
		
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
			ingredients : Object.toArray(this.ingredients.inBar),
			showPhotos : this.showPhotos,
			barName : this.barName 
		}))
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(!this.ingredients.add(ingredient)) return
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.recommIngr = this.computeRecommIngr(this.recommGroups)
		
		var me = this
		this.ingredients.sort(function(a ,b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		this.view.renderRecommBlocks(this.recommIngr)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.remove(ingredient)
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.recommIngr = this.computeRecommIngr(this.recommGroups)
		
		var me = this
		this.ingredients.sort(function(a ,b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.ingredients.inBar)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		this.view.renderRecommBlocks(this.recommIngr)
	},
	
	switchCocktailsView : function(showPhotos)
	{
		this.showPhotos = showPhotos
		this.saveStorage()
		
		this.view.renderCocktails(this.cocktails, showPhotos)
	},
	
	setNewBarName : function(barName)
	{
		this.barName = barName
		this.saveStorage()
		this.view.renderBarName(barName)
	}
}
Object.extend(Me.prototype, myProto)
})();
