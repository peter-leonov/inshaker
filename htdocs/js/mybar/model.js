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
		var me = this, bar = {  ingredients : [], showPhotos : true, barName : '', showByCocktails : true, notAvailableCocktails : {}, showIngByGroups : false }
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
			me.showByCocktails = bar.showByCocktails
			me.notAvailableCocktails = bar.notAvailableCocktails
			me.showIngByGroups = bar.showIngByGroups
			
			me.ingredients = me.getIngredients(bar.ingredients)
			me.cocktails = me.computeCocktails(me.ingredients)
			me.ingredients.sort(function(a,b){ return me.sortByUsage(a,b) })

			me.tipIngredient = me.computeTipIngr()

			me.mustHave = <!--# include virtual="/db/mybar/musthave.js" -->
			//me.recommIngr = me.computeRecommIngr(me.mustHave) //compute bottomOutput
			me.computeRecommIngr(me.mustHave)
			
			//me.packageCocktails = <!--# include virtual="/db/mybar/packages.js" -->
			//me.boItems = me.computeBoItems(me.bottomOutput, me.packageCocktails)
			
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
			return Ingredient.sortByGroups(a.name, b.name)

		var u = this.ingredients.usage || {}
		
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
	
				if(cocktailsHash[cocktail.name])
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
				
				if(nm == jl - 1)
					continue
				
				if(!groups[nm])
				{
					groups[nm] = [{ ingredients : notMatched, cocktails : [cocktail] }]
				}
				else
				{
					for (var k = 0, kl = groups[nm].length; k < kl; k++) 
					{
						var ingredients = groups[nm][k].ingredients
						var f = true
						for (var kk in ingredients) 
						{
							if(!notMatched[kk])
							{
								f = false
								break
							} 
						}
						if(f)
						{
							groups[nm][k].cocktails.push(cocktail)
							break
						}
					}
					if(!f)
					{
						groups[nm].push({ ingredients : notMatched, cocktails : [cocktail] })
					}
				}
			}
		}
		
		var recommends = this.recommends = []
		var notMustHave = {}
		
		for (var i = 0, il = groups.length; i < il; i++) 
		{
			if(groups[i])
			{
				for (var j = 0, jl = groups[i].length; j < jl; j++) 
				{
					var item = groups[i][j]
					var ingredientNames = item.ingredients
					var ingredients = []
					for (var name in ingredientNames) 
					{
						notMustHave[name] = true
						ingredients.push(Ingredient.getByName(name))
					}
					recommends.push({ ingredients : ingredients, cocktails : item.cocktails })
				}
				break
			}
		}
		
		log(this.ingredients)
		
		var me = this
		for (var i = 0, il = recommends.length; i < il; i++) 
		{
			recommends[i].ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
			recommends[i].cocktails.sort(function(a, b){ return me.sortCocktails(a, b) })
		}
		
		recommends.sort(function(a, b){ return a.cocktails.length - b.cocktails.length })
		
		//each ingr usage
		Ingredient.calculateEachIngredientUsage()
		
		var mustHaveArr = this.mustHaveRecommends = []
		for (var k in mustHave) 
		{
			if(!notMustHave[k])
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
		Storage.put('mybar', JSON.stringify({ 
			ingredients : Object.toArray(this.ingredients.inBar),
			showPhotos : this.showPhotos,
			barName : this.barName,
			showByCocktails : this.showByCocktails,
			notAvailableCocktails : this.notAvailableCocktails,
			showIngByGroups : this.showIngByGroups
		}))
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(!this.ingredients.add(ingredient)) return
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
	}
}
Object.extend(Me.prototype, myProto)
})();
