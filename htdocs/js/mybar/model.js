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
		
		var originAdd = BarStorage.addIngredient
		var originRem = BarStorage.removeIngredient
		var me = this
		
		BarStorage.addIngredient = function(ingredientName)
		{
			return me.addIngredientToBar(Ingredient.getByName(ingredientName))
		}
		
		BarStorage.removeIngredient = function(ingredientName)
		{
			return me.removeIngredientFromBar(Ingredient.getByName(ingredientName))
		}
		
	},
	
	bind : function ()
	{
		var me = this
		BarStorage.initBar(function(bar){ me.setMainState(bar) })
	},
	
	setMainState : function(bar)
	{
		var me = this
		this.showPhotos = bar.showPhotos
		this.barName = bar.barName
		this.showByCocktails = bar.showByCocktails
		this.notAvailableCocktails = bar.notAvailableCocktails
		this.showIngByGroups = bar.showIngByGroups

		this.ingredients = this.getIngredients(bar.ingredients)
		this.cocktails = this.computeCocktails(this.ingredients)
		this.ingredients.sort(function(a,b){ return me.sortByUsage(a,b) })

		this.tipIngredient = this.computeTipIngr()

		this.mustHave = <!--# include virtual="/db/mybar/musthave.js" -->
		//this.recommIngr = this.computeRecommIngr(this.mustHave) //compute bottomOutput
		this.computeRecommIngr(this.mustHave)
		
		//this.packageCocktails = <!--# include virtual="/db/mybar/packages.js" -->
		//this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		this.parent.setBar()
		
		//ingr searcher
		var ingredients = Ingredient.getAllNames(),
			secondNames = Ingredient.getAllSecondNames(),
			secondNamesHash = Ingredient.getNameBySecondNameHash()
			
		var set = ingredients.slice()
		set.push.apply(set, secondNames)
		set.sort()
		
		var searcher = this.searcher = new IngredientsSearcher(set, secondNamesHash)
		this.view.setCompleterDataSource(searcher)		
	},
	
	
	
	sortByUsage : function(a, b)
	{
		if(a.group != b.group)
			return Ingredient.sortByGroups(a.name, b.name)

		var u = this.ingredients.usage
		
		var r = (u[b.name] || 0) - (u[a.name] || 0)

		return r != 0 ? r : a.name.localeCompare(b.name)
	},
	
	setIngredients : function()
	{
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
	},
	
	setCocktails : function()
	{
		this.view.renderCocktails(this.cocktails, this.showPhotos)
	},
	
	setBottomOutput : function()
	{
		//this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
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
		var me = this
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
			cocktails = [],
			hash = {}
			
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
			hash[cocktail.name] = true
		}
		
		cocktails.hash = hash
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
	
	computeTipIngr : function()
	{
		var ingrds = Ingredient.getByGroup('Крепкий алкоголь')
		var l = ingrds.length
		while(1)
		{
			var j = Math.floor(Math.random() * l)
			if(this.ingredients.inBar[ingrds[j].name])
			{
				ingrds.splice(j, 1)
				if(--l == 1)
					return ingrds[0]
			}
			else
				return ingrds[j]
		}
	},
	
	computeRecommIngr : function(mustHave)
	{
		var cocktails = Cocktail.getAll(),
			cocktailsHash = Array.toHash(this.cocktails.map(function(a){ return a.name })),
			bo = {} //bottom output
			this.bottomOutput = bo
			
		var groups = []

		if(this.ingredients.length)
		{
			for (var i = 0, il = cocktails.length; i < il; i++) 
			{
				var cocktail = cocktails[i]
				var name = cocktail.name
				
				if(cocktailsHash[name])
					continue
	
				var set = cocktail.ingredients
				var a = -1, oi = false
				var notMatched = {}
				var nm = -1
	
				for (var j = 0, jl = set.length; j < jl; j++) 
				{
					var ingName = set[j][0]
	
					if(!this.ingredients.inBar[ingName])
					{
						notMatched[ingName] = true
						nm++
					}
				}
				
				//all ings not in Bar. it's no recommend
				if(nm == jl - 1)
					continue
					
				if(!groups[nm])
					groups[nm] = []
				
				{
					var currCocktails = {}
						currCocktails[name] = true
						
					var noLessExtends = false
					for (var k = groups.length - 1; k >= 0; k--) 
					{
						if(!groups[k])
							groups[k] = []
							
						
						
						ck:
						for (var j = 0, jl = groups[k].length; j < jl; j++) 
						{
							var f1 = f2 = true
							
							var g = groups[k][j]
							var ings = g.ingredients
							var gCocktails = g.cocktails
							
							if(f1 && !gCocktails[name])
								groups[k]
							
							
							//more groups
							for (var kk in notMatched) 
							{
								if(!ings[kk])
									f1 = false
							}							
							
							if(f1)
							{
								gCocktails[name] = true
								
								if(nm == k)
									noLessExtends = true
							
								break
							}
							
							//if(noLessExtends)
							//	continue ck
							
							//less groups
							for (var kk in ings) 
							{
								if(!notMatched[kk])
									f2 = false
							}
							
							if(f2)
							{
								Object.extend(currCocktails, gCocktails)
							}
						}
						
						if(nm == k && !noLessExtends)
							groups[k].push({ ingredients : notMatched, cocktails : currCocktails })
					}
				}
			}
		}
		
		log(groups)
		
		var recommends = this.recommends = []
		var notMustHave = {}
		
		for (var i = 0, il = groups.length; i < il; i++) 
		{
			for (var j = 0, jl = groups[i].length; j < jl; j++) 
			{
				var item = groups[i][j]
				var ingredientNames = item.ingredients
				var ingredients = []
				ingredients.weights = []
				
				for (var name in ingredientNames) 
				{
					if(i == 0)
						notMustHave[name] = true

					var ingredient = Ingredient.getByName(name)
					var w = Ingredient.groups.indexOf(ingredient.group)
					ingredients.push(ingredient)
					ingredients.weights[w] = ingredients.weights[w] + 1 || 1	
				}
				recommends.push({ ingredients : ingredients, cocktails : Object.toArray(item.cocktails).map(function(a){ return Cocktail.getByName(a) }) })
			}
			if(i == 2 && ingredients.length)
				break
		}
		
		Ingredient.calculateEachIngredientUsage()
		
		var me = this
		for (var i = 0, il = recommends.length; i < il; i++) 
		{
			recommends[i].ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
			recommends[i].cocktails.sort(function(a, b){ return me.sortCocktails(a, b) })
		}
		
		recommends.sort(function(a, b)
		{
			var aw = a.ingredients.weights
			var bw = b.ingredients.weights
			
			var r = 0
			for (var i = Ingredient.groups.length - 1; i >= 0; i--) 
			{
				var t = (aw[i] || 0) - (bw[i] || 0)
				if(t != 0)
					r = t
			}
			
			if(r)
				return -r
				
			var r = a.cocktails.length - b.cocktails.length
			
			if(r)
				return r
				
			var ai = a.ingredients
			var bi = b.ingredients
			
			var r = 0
			for (var i = 0, il = ai.length; i < il; i++) 
			{
				r = ai[i].cocktails.length - bi[i].cocktails.length
				if(r)
					return r
			}
			/*
							var ai = a.ingredients
							var bi = b.ingredients
							var r = ai.length - bi.length || b.cocktails.length - a.cocktails.length
							if(r)
								return r
							
							for (var i = 0, il = ai.length; i < il; i++) 
							{
								var ia = ai[i]
								var ib = bi[i]
								if(ia.name == ib.name)
									continue
								if(ia.group != ib.group)
									return -Ingredient.sortByGroups(ia.name, ib.name)
								return ia.name.localeCompare(ib.name)
							}
			*/
			
		}).reverse()
		
		var mustHaveArr = this.mustHaveRecommends = []
		for (var k in mustHave) 
		{
			if(!notMustHave[k] && !this.ingredients.inBar[k])
				mustHaveArr.push({ ingredient : Ingredient.getByName(k), description : mustHave[k] })
		}
		
		mustHaveArr.sort(function(a, b)
		{
			var ai = a.ingredient,
				bi = b.ingredient
				
			if(ai.group != bi.group)
				return Ingredient.sortByGroups(bi.name, ai.name)
				
			return bi.cocktails.length - ai.cocktails.length
		})
	},

	computeBoItems : function(bottomOutput, packageCocktails)
	{	
		var t = []
		for (var k in bottomOutput)
			t.push({ ingredient : Ingredient.getByName(k), cocktails : bottomOutput[k].sort(this.sortCocktails) })
		
		if(t.length)
		{	
			this.showPackages = false
			
			return t.sort(function(a,b){
				var ai = a.ingredient,
					bi = b.ingredient
					
				if(ai.group != bi.group)
					return Ingredient.sortByGroups(bi.name, ai.name)
				
				
				var r = b.cocktails.length - a.cocktails.length
				if(r) 
					return r
					
				return ai.name.localeCompare(bi.name)
			})
		}
		
		this.showPackages = true
		var packages = packageCocktails.map(function(a){ return Cocktail.getByName(a) })
		
		var me = this
		return packages.sort(function(a, b){
			var ai = a.ingredients,
				bi = b.ingredients,
				inBar = me.ingredients.inBar
				
			var l = ai.length > bi.length ? ai.length : bi.length
			
			for (var i = aj = bj = 0; i < l; i++) 
			{
				var aii = ai[i] ? ai[i][0] : false,
					bii = bi[i] ? bi[i][0] : false
					
				if(!inBar[aii] && !inBar[bii] || inBar[aii] && inBar[bii])
					continue
					
				if(inBar[aii])
					aj++
				else if(inBar[bii])
					bj++	
			}
			
			if(aj != bj)
				return bj - aj
			return ai.length - bi.length
		})
	},
	
	saveStorage : function()
	{
		BarStorage.saveBar({ 
			ingredients : Object.toArray(this.ingredients.inBar),
			showPhotos : this.showPhotos,
			barName : this.barName,
			showByCocktails : this.showByCocktails,
			notAvailableCocktails : this.notAvailableCocktails,
			showIngByGroups : this.showIngByGroups
		})
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(!this.ingredients.add(ingredient))
			return false
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		//this.recommIngr = this.computeRecommIngr(this.mustHave)
		this.computeRecommIngr(this.mustHave)
		//this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		var me = this
		this.ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		//this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
		
		return true
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.remove(ingredient)
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		//this.recommIngr = this.computeRecommIngr(this.mustHave)
		this.computeRecommIngr(this.mustHave)
		//this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		var me = this
		this.ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		//this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
		
		return true
	},
	
	switchIngredientsView : function(byGroups)
	{
		this.showIngByGroups = byGroups
		this.saveStorage()

		this.view.renderIngredients(this.ingredients, byGroups, this.tipIngredient)
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
	},
	
	switchBoShowType : function(showByCocktails)
	{
		if(showByCocktails)
			this.showByCocktails = true
		else
			this.showByCocktails = false
			
		this.saveStorage()
		
		this.boItems = this.computeBoItems(this.bottomOutput, this.showByCocktails)
		this.view.renderBottomOutput(this.boItems, this.showByCocktails)
	},
	
	addIngredientsFromBo : function(ingredients)
	{
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			this.ingredients.add(ingredients[i])
		}
		
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		//this.recommIngr = this.computeRecommIngr(this.mustHave)
		this.computeRecommIngr(this.mustHave)
		//this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		var me = this
		this.ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		//this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
	},
	
	selectIngredient : function(ingredient)
	{
		this.view.showIngredient(ingredient)
	}
}
Object.extend(Me.prototype, myProto)
})();
