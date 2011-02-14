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
			me.recommIngr = me.computeRecommIngr(me.mustHave) //compute bottomOutput
			
			me.packageCocktails = <!--# include virtual="/db/mybar/packages.js" -->
			me.boItems = me.computeBoItems(me.bottomOutput, me.packageCocktails)
			
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
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
	},
	
	setCocktails : function()
	{
		this.view.renderCocktails(this.cocktails, this.showPhotos)
	},
	
	setBottomOutput : function()
	{
		this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
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
			ingHash = this.ingredients.inBar,
			cocktailsHash = Array.toHash(this.cocktails.map(function(a){ return a.name })),
			bo = {} //bottom output
			this.bottomOutput = bo //showBy Cocktails
			
			var  t = {}

		ck:
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cocktail = cocktails[i]

			if(cocktailsHash[cocktail.name])
				continue

			var set = cocktail.ingredients
			var a = -1, oi = null

			for (var j = 0, jl = set.length; j < jl; j++) 
			{
				var ingName = set[j][0]

				if(!ingHash[ingName])
				{
					if(mustHave[ingName] && t[ingName] !== false)
						t[ingName] = mustHave[ingName]

					//collect items for bottom output
					oi = ingName	
					a++
				}
			}
			
			if(a == 0)
			{
				if(oi && !bo[oi])
					bo[oi] = []
				
				bo[oi].push(cocktail)
				t[oi] = false
			}
		}
		
		//each ingr usage
		Ingredient.calculateEachIngredientUsage()
		
		var mustHaveArr = []
		for (var k in t) 
		{
			if(t[k])
				mustHaveArr.push({ ingredient : Ingredient.getByName(k), description : t[k] })
		}
		
		return mustHaveArr.sort(function(a, b)
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
		this.recommIngr = this.computeRecommIngr(this.mustHave)
		this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		var me = this
		this.ingredients.sort(function(a ,b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.remove(ingredient)
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.recommIngr = this.computeRecommIngr(this.mustHave)
		this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		var me = this
		this.ingredients.sort(function(a ,b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
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
		this.recommIngr = this.computeRecommIngr(this.mustHave)
		this.boItems = this.computeBoItems(this.bottomOutput, this.packageCocktails)
		
		var me = this
		this.ingredients.sort(function(a ,b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showPhotos)
		this.view.renderBottomOutput(this.recommIngr, this.boItems, this.showPackages, this.ingredients.inBar, this.cocktails.hash)
	}
}
Object.extend(Me.prototype, myProto)
})();
