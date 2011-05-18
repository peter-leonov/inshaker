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
		BarStorage.initBar(function(bar){ me.setBar(bar) })
	},
	
	setBar : function(bar)
	{
		var me = this
		
		this.bar = bar
		
		this.showCocktailsType = bar.showCocktailsType
		this.barName = bar.barName
		this.showByCocktails = bar.showByCocktails
		this.notAvailableCocktails = bar.notAvailableCocktails
		this.showIngByGroups = bar.showIngByGroups

		this.ingredients = this.getIngredients(bar.ingredients)
		this.cocktails = this.computeCocktails(this.ingredients)
		this.ingredients.sort(function(a,b){ return me.sortByUsage(a,b) })

		this.tipIngredient = this.computeTipIngr()
		
		this.allTags = <!--# include virtual="/db/mybar/tags.json" -->
		this.mustHave = <!--# include virtual="/db/mybar/musthave.json" -->
		
		this.computeRecommendsBlock()
		
		this.foreignData = bar.foreignData
		
		this.parent.setMainState()
		
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
	
	setMainState : function()
	{
		this.view.renderBarName(this.barName)
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showCocktailsType)
		this.view.renderTagsSelect(this.tags, this.currentTag, this.tagsAmount)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
		this.view.renderShare(this.foreignData.userid)
	},
	
	computeRecommendsBlock : function()
	{
		this.allRecommends = this.computeAllRecommends(this.ingredients.inBar)
		this.tags = this.getTags(this.allRecommends, this.allTags)	
		this.currentTag = this.getCurrentTag(this.tags, this.bar.currentTag)
		this.recommends = this.computeRecommends(this.allRecommends, this.currentTag)
		this.mustHaveRecommends = this.computeMustHave(this.mustHave)
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
		var ingredients = fetchIngredients(ingredientNames)
		ingredients.inBar = Array.toHash(ingredientNames)
		
		ingredients.add = function(ingredient)
		{
			if(this.inBar[ingredient.name])
				return false
			this.push(ingredient)
			this.sort(function(a,b){ return Ingredient.sortByGroups(a.name, b.name) })
			this.inBar[ingredient.name] = true
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
				var ingredient = Ingredient.getByName(ingredientNames[i])
				if(ingredient)
					ingredients.push(ingredient)
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
	
	computeAllRecommends : function(inBar)
	{
		var cocktails = Cocktail.getAll(),
			cocktailsHash = Array.toHash(this.cocktails.map(function(a){ return a.name })),
			recommends = []
			
		var limit = false,
			lim = 3
		
		if(this.ingredients.length == 0)
			return []
		
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
				var cocktail = cocktails[i]
				var name = cocktail.name
				var notMatched = {}
				var matched = {}
				
				if(cocktailsHash[name])
					continue
				
				var set = cocktail.ingredients
				
				for (var j = 0, t = 0, z = 0, jl = set.length; j < jl; j++) 
				{
					var ingName = set[j][0]
	
					if(!inBar[ingName])
					{
						notMatched[ingName] = true
						t++
					}
					else
					{
						matched[ingName] = true
						z++
					}
				}
				
				if(z == 1 && (matched['Лед в кубиках'] || matched['Лед дробленый']) || z == 2 && matched['Лед в кубиках'] && matched['Лед дробленый'])
					continue
				
				if(t < j)
				{
					if(t <= lim)
						limit = true
					
					if(limit && t > lim)
						continue
					
					var h = {}
					h[name] = true
					recommends.push({ cocktails : h, ingredients : notMatched, len : t, cocktail : cocktail })
				}
		}

		if(limit)
		{
			var nr = []
			for (var i = 0, il = recommends.length; i < il; i++)
			{
				var r = recommends[i]
				if(r.len <= lim)
					nr.push(r)
			}
			return nr
		}

		return recommends
	},
	
	getTags : function(recommends, allTags)
	{
		var hash = {}
		var cocktails = recommends.map(function(a){ return a.cocktail })
		
		this.tagsAmount = {}
		
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var tags = cocktails[i].tags
			for (var j = 0, jl = tags.length; j < jl; j++) 
			{
				var t = tags[j]
				
				hash[t] = true
				
				if(!this.tagsAmount[t])
					this.tagsAmount[t] = 0
				this.tagsAmount[t]++
			}
		}
			
		var tags = []

		for (var i = 0, il = allTags.length; i < il; i++) 
		{
			var tag = allTags[i]
			if(hash[tag])
			{
				tag.amount = hash[tag]
				tags.push(tag)
			}
		}
		
		return tags
	},
	
	getCurrentTag : function(tags, currentTag)
	{
		if(tags.indexOf(currentTag) == -1 || !currentTag)
			return tags[0]
		
		return currentTag
	},
	
	computeRecommends : function(allRecommends, tag)
	{
		var recommends = []
		for (var i = 0, il = allRecommends.length; i < il; i++) 
		{
			var r = allRecommends[i]
			var c = r.cocktail
			r.cocktails = {}
			r.cocktails[c.name] = true
			if(c.tags.indexOf(tag) !== -1)
				recommends.push(r)
		}
		
		recommends.sort(function(a, b){ return a.len - b.len })

		var t = []
		
		for (var i = 0, il = recommends.length; i < il; i++) 
		{
			var curr = recommends[i]
			ck:
			for (var j = i + 1; j < il; j++) 
			{
				var r = recommends[j]
				for (var k in curr.ingredients) 
				{
					if(!r.ingredients[k])
						continue ck	
					}
				
				Object.extend(r.cocktails, curr.cocktails)
				if(curr.len == r.len)
					recommends[i] = null
			}
		}
		
		var groups = []
		
		Ingredient.calculateEachIngredientUsage()
		
		this.exclusions = {}
		var me = this
		
		for (var i = 0, il = recommends.length; i < il; i++) 
		{
			var r = recommends[i]
			
			if(!r)
				continue
			
			if(r.len == 1)
				Object.extend(this.exclusions, r.ingredients)
			
			var ingredients = Object.toArray(r.ingredients).map(function(a){ return Ingredient.getByName(a) })
			ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
			
			var weights = []
			for (var j = 0, jl = ingredients.length; j < jl; j++) 
			{
				var ingredient = ingredients[j]
				var w = Ingredient.groups.indexOf(ingredient.group)
				
				weights[w] = weights[w] + 1 || 1
			}
			
			ingredients.weights = weights
			
			var cocktails = Object.toArray(r.cocktails).map(function(a){ return Cocktail.getByName(a) })
			cocktails.sort(function(a, b){ return me.sortCocktails(a, b) })
			
			var inBar = this.ingredients.inBar,
				havingIngredients = {}
			
			
			for (var ci = 0, cil = cocktails.length; ci < cil; ci++) 
			{
				var set = cocktails[ci].ingredients
				for (var s = 0, sl = set.length; s < sl; s++) 
				{
					var ingr = set[s][0]
					if(inBar[ingr])
					havingIngredients[ingr] = true
				}
			}
			
			
			havingIngredients = Object.toArray(havingIngredients).sort(Ingredient.sortByGroups).map(function(name){ return Ingredient.getByName(name) })
			
			groups.push({ ingredients : ingredients, cocktails : cocktails, havingIngredients : havingIngredients })
		}
		
		return groups.sort(function(a,b){ return me.sortRecommends(a,b) }).reverse()
	},
	
	sortRecommends : function(a, b)
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
		
		return 0
	},
	
	
	computeMustHave : function(mustHave)
	{
		var mustHaveRecommends = []
		for (var k in mustHave) 
		{
			if(!this.exclusions[k] && !this.ingredients.inBar[k])
				mustHaveRecommends.push({ ingredient : Ingredient.getByName(k), description : mustHave[k] })
		}
		
		return mustHaveRecommends.sort(function(a, b)
		{
			var ai = a.ingredient,
				bi = b.ingredient
				
			if(ai.group != bi.group)
				return Ingredient.sortByGroups(bi.name, ai.name)
				
			return bi.cocktails.length - ai.cocktails.length
		})		
	},
	
	saveStorage : function()
	{
		BarStorage.saveBar({ 
			ingredients : Object.toArray(this.ingredients.inBar),
			showCocktailsType : this.showCocktailsType,
			showByCocktails : this.showByCocktails,
			showIngByGroups : this.showIngByGroups,
			currentTag : this.currentTag
		})
	},
	
	addIngredientToBar : function(ingredient)
	{
		if(!this.ingredients.add(ingredient))
			return false
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.computeRecommendsBlock()
		
		var me = this
		this.ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showCocktailsType)
		this.view.renderTagsSelect(this.tags, this.currentTag, this.tagsAmount)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
		
		return true
	},
	
	removeIngredientFromBar : function(ingredient)
	{
		this.ingredients.remove(ingredient)
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.computeRecommendsBlock()
		
		var me = this
		this.ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showCocktailsType)
		this.view.renderTagsSelect(this.tags, this.currentTag, this.tagsAmount)
		
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
		return true
	},
	
	switchIngredientsView : function(byGroups)
	{
		this.showIngByGroups = byGroups
		this.saveStorage()

		this.view.renderIngredients(this.ingredients, byGroups, this.tipIngredient)
	},
	
	switchCocktailsView : function(showCocktailsType)
	{
		this.showCocktailsType = showCocktailsType
		this.saveStorage()
		
		this.view.renderCocktails(this.cocktails, showCocktailsType)
	},
	
	switchBoShowType : function(showByCocktails)
	{
		if(showByCocktails)
		{
			this.showByCocktails = true
		}
		else
		{
			this.showByCocktails = false
		}
			
		this.saveStorage()
		
		this.boItems = this.computeBoItems(this.bottomOutput, this.showByCocktails)
		this.view.renderBottomOutput(this.boItems, this.showByCocktails)
	},
	
	addIngredientsFromBo : function(ingredients)
	{
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			this.ingredients.add(ingredient)
		}
		
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		
		var me = this
		this.ingredients.sort(function(a, b){ return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.showIngByGroups, this.tipIngredient)
		this.view.renderCocktails(this.cocktails, this.showCocktailsType)
		
		this.view.setHaving(this.ingredients.inBar, this.cocktails.hash)
		this.view.updateRecommends()
		
		this.view.setScrollTopRecommends()
	},
	
	selectIngredient : function(ingredient)
	{
		this.view.showIngredient(ingredient)
	},
	
	showTagRecommends : function(tag)
	{
		this.currentTag = tag
		this.saveStorage()
		
		this.recommends = this.computeRecommends(this.allRecommends, this.currentTag)
		this.mustHaveRecommends = this.computeMustHave(this.mustHave)
		
		this.view.renderTagsSelect(this.tags, this.currentTag, this.tagsAmount)
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends, true)
		
		//this.view.setScrollTopTags()
	},
	
	getForeignLink : function()
	{
		var me = this
		BarStorage.getForeignLink(function(foreignData){
			me.foreignData = foreignData
			me.view.renderShare(foreignData.userid)
		})
	},
	
	upgradeRecommends : function()
	{
		this.computeRecommendsBlock()
		
		this.view.renderTagsSelect(this.tags, this.currentTag, this.tagsAmount)	
		
		this.view.setHaving({}, {})
		this.view.renderBottomOutput(this.mustHaveRecommends, this.recommends)
	}
}
Object.extend(Me.prototype, myProto)
})();
