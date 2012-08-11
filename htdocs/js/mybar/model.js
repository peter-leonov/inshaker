;(function(){

Array.toHash = function (arr)
{
	var hash = {}
	for (var i = 0, il = arr.length; i < il; i++)
		hash[arr[i]] = true
	return hash
}

Object.toArray = function (obj)
{
	var arr = []
	for (var k in obj)
		if (obj[k])
			arr.push(k)
	return arr
}

var Papa = MyBar, Me = Papa.Model
var myProto =
{
	initialize: function()
	{
		this.ingredients = []
		this.recommends = []
		this.recommIngr = []
		this.recommendsUpgraded = true
		this.topBlockUpgraded = true
		
		var originAdd = BarStorage.addIngredient
		var originRem = BarStorage.removeIngredient
		var me = this
		
		BarStorage.addIngredient = function (ingredientName)
		{
			var ingredient = Ingredient.getByName(ingredientName)
			me.ingredients.add(ingredient)
			me.recommendsUpgraded = false
			me.topBlockUpgraded = false
			me.saveStorage()
			me.cocktails = me.computeCocktails(me.ingredients)
			me.view.updateRecommends(me.cocktails.hash, me.ingredients.hash)
			me.view.showIngredient(ingredient)
		}
		
		BarStorage.removeIngredient = function (ingredientName)
		{
			var ingredient = Ingredient.getByName(ingredientName)
			me.ingredients.remove(ingredient)
			me.recommendsUpgraded = false
			me.topBlockUpgraded = false
			me.saveStorage()
			me.cocktails = me.computeCocktails(me.ingredients)
			me.view.updateRecommends(me.cocktails.hash, me.ingredients.hash)
			me.view.showIngredient(ingredient)
		}
	},
	
	bind: function ()
	{
		var me = this
		BarStorage.initBar(function (bar, id) { me.setBar(bar, id) })
	},
	
	setBar: function (bar, id)
	{
		var me = this
		
		this.bar = bar
		this.id = id
		
		this.barName = bar.barName
		this.ingredientsShowType = bar.ingredientsShowType
		this.cocktailsShowType = bar.cocktailsShowType
		
		this.ingredients = this.getIngredients(bar.ingredients)
		this.cocktails = this.computeCocktails(this.ingredients)
		this.hiddenCocktailsHash = Array.toHash(bar.hiddenCocktails)
		this.divideCocktails(this.cocktails, this.hiddenCocktailsHash)
		this.ingredients.sort(function (a,b) { return me.sortByUsage(a, b) })
		
		this.settingsData = <!--# include virtual="/db/mybar/settings.json" -->
		this.allTags = this.settingsData.tags
		this.luckyIngredients = this.settingsData.luckyButtonIngredients.randomize()
		this.maybeHaveIngredients = this.ingredients.length ? false : this.fetchIngredients(this.settingsData.maybeHaveIngredients)
		this.mustHave = this.settingsData.mustHaveIngredients
		
		this.computeRecommendsBlock()
		
		this.foreignData = bar.foreignData
		
		this.parent.setMainState()
		
		this.setupSearcher()
	},
	
	setupSearcher: function ()
	{
		var ingredients = Ingredient.getAll()
		
		var forbiddenGroups =
		{
			'Посуда': true,
			'Штучки': true,
			'Украшения': true
		}
		
		var set = [], bySecondName = {}
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				name = ingredient.name
			
			if (forbiddenGroups[ingredient.group])
				continue
			
			set.push(name)
			
			var snames = ingredient.names
			if (!snames)
				continue
			
			for (var j = 0, jl = snames.length; j < jl; j++)
			{
				var sname = snames[j]
				set.push(sname)
				bySecondName[sname] = name
			}
		}
		set.sort()
		
		var searcher = new IngredientsSearcher(set, bySecondName)
		this.view.setCompleterDataSource(searcher)
	},
	
	setMainState: function ()
	{
		var me = this
		this.view.showView()
		this.view.renderBarName(this.barName)
		this.view.renderIngredients(this.ingredients, this.ingredientsShowType)
		this.view.focusSearchInput()
		window.setTimeout(function () { me.view.renderCocktails(me.visibleCocktails, me.hiddenCocktails, me.cocktailsShowType) }, 0)
		this.view.renderShareLinks(this.id)
		this.view.renderTags(this.tags, this.currentTag, this.tagsAmount)
		this.view.prepareRecommends()
	},
	
	computeRecommendsBlock: function ()
	{
		this.allRecommends = this.computeAllRecommends()
		this.tags = this.getTags(this.allRecommends, this.allTags)
		this.currentTag = this.getCurrentTag(this.tags, this.bar.currentTag)
		this.recommends = this.computeRecommends(this.allRecommends, this.currentTag)
		if (!this.recommends.length)
			this.recommends = this.getRecommendsFromPackages(this.settingsData.packages)
		this.mustHaveRecommends = this.computeMustHave(this.mustHave)
		this.view.renderMenuNums(this.ingredients, this.cocktails, this.allRecommends)
	},
	
	sortByUsage: function (a, b)
	{
		if (a.group != b.group)
			return Ingredient.compareByGroup(a, b)
		
		var u = this.ingredients.usage
		
		var r = (u[b.name] || 0) - (u[a.name] || 0)
		
		return r != 0 ? r : a.name.localeCompare(b.name)
	},
	
	getIngredients: function (ingredientNames)
	{
		var ingredients = this.fetchIngredients(ingredientNames)
		ingredients.hash = Array.toHash(ingredientNames)
		
		var me = this
		ingredients.add = function (ingredient)
		{
			if (this.hash[ingredient.name])
				return false
			this.push(ingredient)
			this.sort(function(a,b){ return Ingredient.compareByGroup(a, b) })
			this.hash[ingredient.name] = true
			return this
		}
		
		ingredients.remove = function (ingredient)
		{
			this.hash[ingredient.name] = null
			this.length = 0
			Object.extend(this, me.fetchIngredients(Object.toArray(this.hash)))
			return this
		}
		return ingredients
	},
	
	fetchIngredients: function (ingredientNames)
	{
		var ingredients = []
		for (var i = 0, il = ingredientNames.length; i < il; i++)
		{
			var ingredient = Ingredient.getByName(ingredientNames[i])
			if (ingredient)
				ingredients.push(ingredient)
		}
		return ingredients.sort(function (a, b) { return Ingredient.compareByGroup(a, b) })
	},
	
	computeCocktails: function (ingredients)
	{
		var	cocktails = [], hash = cocktails.hash = {}
		ingredients.usage = {}
		
		if (Object.isEmpty(ingredients.hash))
			return cocktails
		
		var needCocktails = Cocktail.getByAnyOfIngredientsNames(Object.toArray(ingredients.hash))
		
		ck:
		for ( var i = 0, il = needCocktails.length; i < il; i++ )
		{
			var cocktail = needCocktails[i]
			var ing = cocktail.ingredients
			for (var j = 0, jl = ing.length; j < jl; j++)
			{
				if (!ingredients.hash[ing[j][0]])
					continue ck
			}
			
			for (var k = 0, kl = ing.length; k < kl; k++)
			{
				var ingr = ing[k][0]
				if (!ingredients.usage[ingr])
					ingredients.usage[ingr] = 1
				else
					ingredients.usage[ingr]++
			}
			
			cocktails.push(cocktail)
			hash[cocktail.name] = true
		}
		
		return cocktails.sort(this.sortCocktails)
	},
	
	sortCocktails: function (a, b)
	{
		var t = a.ingredients.length - b.ingredients.length
		if (t)
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
			
			if (aa.group != bb.group)
				return Ingredient.compareByGroup(aa, bb)
			
			lc = aa.name.localeCompare(bb.name)
			if (lc)
				return lc
		}
		return lc
	},
	
	divideCocktails: function (cocktails, hidden)
	{
		var visibleCocktails = this.visibleCocktails = []
		var hiddenCocktails = this.hiddenCocktails = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			if (hidden[cocktail.name])
			{
				hiddenCocktails.push(cocktail)
			}
			else
			{
				visibleCocktails.push(cocktail)
			}
		}
	},
	
	computeTipIngr: function ()
	{
		var ingrds = Ingredient.getByGroup('Крепкий алкоголь')
		var l = ingrds.length
		for (;;)
		{
			var j = Math.floor(Math.random() * l)
			if (this.ingredients.hash[ingrds[j].name])
			{
				ingrds.splice(j, 1)
				if (--l == 1)
					return ingrds[0]
			}
			else
				return ingrds[j]
		}
	},
	
	computeAllRecommends: function ()
	{
		var cocktails = Cocktail.getAll(),
			cocktailsHash = this.cocktails.hash,
			ingredientsHash = this.ingredients.hash,
			recommends = []
		
		var limit = false,
			lim = 3
		
		if (this.ingredients.length == 0)
			return []
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			var name = cocktail.name
			var notMatched = {}
			var matched = {}
			
			if (cocktailsHash[name] || this.hiddenCocktailsHash[name])
				continue
			
			var set = cocktail.ingredients
			
			for (var j = 0, t = 0, z = 0, jl = set.length; j < jl; j++)
			{
				var ingName = set[j][0]
				
				if (!ingredientsHash[ingName])
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
			
			if (z == 1 && (matched['Лед в кубиках'] || matched['Лед дробленый']) || z == 2 && matched['Лед в кубиках'] && matched['Лед дробленый'])
				continue
			
			if (t < j)
			{
				if (t <= lim)
					limit = true
				
				if (limit && t > lim)
					continue
				
				recommends.push({ingredients: notMatched, len: t, cocktail: cocktail})
			}
		}
		
		if (limit)
		{
			var nr = []
			for (var i = 0, il = recommends.length; i < il; i++)
			{
				var r = recommends[i]
				if (r.len <= lim)
					nr.push(r)
			}
			return nr
		}
		
		return recommends
	},
	
	getTags: function (recommends, allTags)
	{
		var hash = {}
		var cocktails = recommends.map(function (a) { return a.cocktail })
		
		this.tagsAmount = {}
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var tags = cocktails[i].tags
			for (var j = 0, jl = tags.length; j < jl; j++)
			{
				var t = tags[j]
				
				hash[t] = true
				
				if (!this.tagsAmount[t])
					this.tagsAmount[t] = 0
				this.tagsAmount[t]++
			}
		}
		
		var tags = []
		
		for (var i = 0, il = allTags.length; i < il; i++)
		{
			var tag = allTags[i]
			if (hash[tag])
			{
				tag.amount = hash[tag]
				tags.push(tag)
			}
		}
		
		return tags
	},
	
	getCurrentTag: function (tags, currentTag)
	{
		if (tags.indexOf(currentTag) == -1 || !currentTag)
			return tags[0]
		
		return currentTag
	},
	
	computeRecommends: function (allRecommends, tag)
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
		
		recommends.sort(function (a, b) { return a.len - b.len })
		
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
					if (!r.ingredients[k])
						continue ck
				}
				
				for (var k in r.ingredients)
				{
					if (!curr.ingredients[k])
						continue ck
				}
				
				Object.extend(r.cocktails, curr.cocktails)
				if (curr.len == r.len)
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
			
			if (!r)
				continue
			
			if (r.len == 1)
				Object.extend(this.exclusions, r.ingredients)
			
			var ingredients = Object.toArray(r.ingredients).map(function (a) { return Ingredient.getByName(a) })
			ingredients.sort(function (a, b) { return me.sortByUsage(a, b) })
			
			var weights = []
			for (var j = 0, jl = ingredients.length; j < jl; j++)
			{
				var ingredient = ingredients[j]
				var w = Ingredient.groups.indexOf(ingredient.group)
				
				weights[w] = weights[w] + 1 || 1
			}
			
			ingredients.weights = weights
			
			var cocktails = Object.toArray(r.cocktails).map(function (a) { return Cocktail.getByName(a) })
			cocktails.sort(function (a, b) { return me.sortCocktails(a, b) })
			
			var inBar = this.ingredients.hash,
				havingIngredients = {}
			
			
			for (var ci = 0, cil = cocktails.length; ci < cil; ci++)
			{
				var set = cocktails[ci].ingredients
				for (var s = 0, sl = set.length; s < sl; s++)
				{
					var ingr = set[s][0]
					if (inBar[ingr])
						havingIngredients[ingr] = true
				}
			}
			
			havingIngredients = Object.toArray(havingIngredients).map(function (name) { return Ingredient.getByName(name) })
			havingIngredients.sort(Ingredient.compareByGroup)
			
			groups.push({ingredients: ingredients, cocktails: cocktails, havingIngredients: havingIngredients})
		}
		
		return groups.sort(function (a, b) { return me.sortRecommends(a,b) }).reverse()
	},
	
	sortRecommends: function (a, b)
	{
		var aw = a.ingredients.weights
		var bw = b.ingredients.weights
		
		var r = 0
		for (var i = Ingredient.groups.length - 1; i >= 0; i--)
		{
			var t = (aw[i] || 0) - (bw[i] || 0)
			if (t != 0)
				r = t
		}
		
		if (r)
			return -r
			
		var r = a.cocktails.length - b.cocktails.length
		
		if (r)
			return r
		
		var ai = a.ingredients
		var bi = b.ingredients
		
		var r = 0
		for (var i = 0, il = ai.length; i < il; i++)
		{
			r = ai[i].cocktails.length - bi[i].cocktails.length
			if (r)
				return r
		}
		
		return 0
	},
	
	getRecommendsFromPackages: function (packages)
	{
		var groups = []
		for (var i = 0, il = packages.length; i < il; i++)
		{
			var cocktail = Cocktail.getByName(packages[i])
			if (!cocktail)
				continue
			
			groups.push(
			{
				ingredients: cocktail.getIngredientNames().map(function (name) { return Ingredient.getByName(name) }).sort(Ingredient.compareByGroup),
				cocktails: [cocktail],
				havingIngredients: []
			})
			
		}
		var me = this
		return groups.sort(function (a, b) { return me.sortCocktails(a.cocktails[0], b.cocktails[0]) })
	},
	
	computeMustHave: function (mustHave)
	{
		var mustHaveRecommends = []
		for (var k in mustHave)
		{
			var ingredient = Ingredient.getByName(k)
			if (!ingredient)
				continue
			
			if (!this.exclusions[k] && !this.ingredients.hash[k])
				mustHaveRecommends.push({ingredient: ingredient, description: mustHave[k]})
		}
		
		mustHaveRecommends.sort(function (a, b)
		{
			var ai = a.ingredient,
				bi = b.ingredient
			
			if (ai.group != bi.group)
				return Ingredient.compareByGroup(bi, ai)
			
			return bi.cocktails.length - ai.cocktails.length
		})
		
		return mustHaveRecommends
	},
	
	saveStorage: function ()
	{
		BarStorage.saveBar
		({
			barName: this.barName,
			ingredients: Object.toArray(this.ingredients.hash),
			cocktailsShowType: this.cocktailsShowType,
			ingredientsShowType: this.ingredientsShowType,
			currentTag: this.currentTag,
			hiddenCocktails: Object.toArray(this.hiddenCocktailsHash)
		})
	},
	
	addIngredientToBar: function (ingredient)
	{
		if (!this.ingredients.add(ingredient))
			return false
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.divideCocktails(this.cocktails, this.hiddenCocktailsHash)
		this.computeRecommendsBlock()
		
		var me = this
		this.ingredients.sort(function (a, b) { return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.ingredientsShowType)
		this.view.renderCocktails(this.visibleCocktails, this.hiddenCocktails, this.cocktailsShowType)
		this.view.renderTags(this.tags, this.currentTag, this.tagsAmount)
		this.view.prepareRecommends()
		
		return true
	},
	
	addLuckyIngredient: function ()
	{
		var names = this.luckyIngredients
		for (var i = 0, il = names.length; i < il; i++)
		{
			var name = names[i]
			if (!this.ingredients.hash[name])
				break;
		}
		this.addIngredientToBar(Ingredient.getByName(name))
	},
	
	removeIngredientFromBar: function (ingredient)
	{
		this.ingredients.remove(ingredient)
		this.saveStorage()
		this.tipIngredient = this.computeTipIngr()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.divideCocktails(this.cocktails, this.hiddenCocktailsHash)
		this.computeRecommendsBlock()
		
		var me = this
		this.ingredients.sort(function (a, b) { return me.sortByUsage(a, b) })
		
		this.view.renderIngredients(this.ingredients, this.ingredientsShowType)
		//this.view.renderMaybeHave(this.maybeHaveIngredients, this.ingredients.hash)
		this.view.renderCocktails(this.visibleCocktails, this.hiddenCocktails, this.cocktailsShowType)
		this.view.renderTags(this.tags, this.currentTag, this.tagsAmount)
		this.view.prepareRecommends()
		
		return true
	},
	
	switchIngredientsView: function (showType)
	{
		this.ingredientsShowType = showType
		this.saveStorage()
		this.view.renderIngredients(this.ingredients, showType)
	},
	
	switchCocktailsView: function (showType)
	{
		this.cocktailsShowType = showType
		this.saveStorage()
		this.view.renderCocktails(this.visibleCocktails, this.hiddenCocktails, showType)
	},
	
	hideCocktail: function (cocktail)
	{
		this.hiddenCocktailsHash[cocktail.name] = true
		this.saveStorage()
		this.divideCocktails(this.cocktails, this.hiddenCocktailsHash)
		this.view.renderCocktails(this.visibleCocktails, this.hiddenCocktails, this.cocktailsShowType)
	},
	
	showCocktail: function (cocktail)
	{
		this.hiddenCocktailsHash[cocktail.name] = false
		this.saveStorage()
		this.divideCocktails(this.cocktails, this.hiddenCocktailsHash)
		this.view.renderCocktails(this.visibleCocktails, this.hiddenCocktails, this.cocktailsShowType)
	},
	
	sendEmail: function (address, mailer, text)
	{
		var me = this
		Request.post('/act/email-friend.cgi', {address: address, mailer: mailer, text: text}, function ()
		{
			if (this.statusType == 'success' && this.status)
			{
				me.view.emailSended()
			}
		})
	},
	
	switchTag: function (tag)
	{
		this.currentTag = tag
		this.saveStorage()
		
		this.recommends = this.computeRecommends(this.allRecommends, this.currentTag)
		this.mustHaveRecommends = this.computeMustHave(this.mustHave)
		
		this.view.renderTags(this.tags, this.currentTag, this.tagsAmount)
		this.view.prepareRecommends()
	},
	
	addIngredientFromRecommends: function (ingredient)
	{
		this.ingredients.add(ingredient)
		this.recommendsUpgraded = false
		this.topBlockUpgraded = false
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.view.updateRecommends(this.cocktails.hash, this.ingredients.hash)
		this.view.renderMenuNums(this.ingredients, this.cocktails, this.allRecommends)
	},
	
	removeIngredientFromRecommends: function (ingredient)
	{
		this.ingredients.remove(ingredient)
		this.recommendsUpgraded = false
		this.topBlockUpgraded = false
		this.saveStorage()
		this.cocktails = this.computeCocktails(this.ingredients)
		this.view.updateRecommends(this.cocktails.hash, this.ingredients.hash)
		this.view.renderMenuNums(this.ingredients, this.cocktails, this.allRecommends)
	},
	
	selectIngredient: function (ingredient)
	{
		this.view.showIngredient(ingredient)
	},
	
	upgradeTopBlock: function ()
	{
		if (this.topBlockUpgraded)
			return
		
		var me = this
		this.divideCocktails(this.cocktails, this.hiddenCocktailsHash)
		this.ingredients.sort(function (a, b) { return me.sortByUsage(a, b) })
		this.topBlockUpgraded = true
		this.view.renderIngredients(this.ingredients, this.ingredientsShowType)
		this.view.renderCocktails(this.visibleCocktails, this.hiddenCocktails, this.cocktailsShowType)
		this.view.setScrollTop()
	},
	
	upgradeRecommends: function ()
	{
		if (this.recommendsUpgraded)
			return
		
		this.computeRecommendsBlock()
		this.recommendsUpgraded = true
		this.view.renderTags(this.tags, this.currentTag, this.tagsAmount)
		this.view.prepareRecommends()
	},
	
	addRecommend: function ()
	{
		var recommend = this.recommends.shift()
		if (recommend)
			this.view.renderRecommend(recommend, this.cocktails.hash, this.ingredients.hash)
	},
	
	addMustHaveRecommend: function ()
	{
		var recommend = this.mustHaveRecommends.shift()
		if (recommend)
			this.view.renderMustHaveRecommend(recommend, this.ingredients.hash)
	},
	
	checkoutRecommends: function ()
	{
		var rLength = this.recommends.length,
			mhLength = this.mustHaveRecommends.length
		if (rLength > 0 || mhLength > 0)
			this.view.checkoutRecommends(rLength, mhLength)
	},
	
	changeBarName: function (barName)
	{
		if (barName)
		{
			this.barName = barName
			this.saveStorage()
		}
		this.view.renderBarName(this.barName)
	}
}

Object.extend(Me.prototype, myProto)

})();
