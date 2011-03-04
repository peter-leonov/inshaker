Array.prototype.hashIndex = function ()
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++)
		hash[this[i]] = true
	return hash
}

var Model = {
	cocktail: null,
	ingredients: [],
	goods: Ingredient.getAllByNameHash(),
	
	dataListener: null,
	
	recs: [], // recommendations
	
	init: function(name){
		this.cocktail = Cocktail.getByName(name);
		this.ingredients = Ingredient.mergeIngredientSets(this.cocktail.ingredients, this.cocktail.garnish).sort(Ingredient.sortByGroups);
		this.tools = Tool.tools;
		
		this.related = this._findRelated(this.cocktail)
		
		this.recs = this._findRecs(this.cocktail);
		if(this.recs.length == 0) this.dataListener.expandRelated();
	},
	
	_findRecs: function(cocktail){
		var recs = [];
		var ingreds = cocktail.ingredients; 
		
		for(var i = 0; i < ingreds.length; i++){
			var items = this.goods[ingreds[i][0]];
			if(items && items.mark && this._doesntHave(recs, items.mark)){
				var rec = {};
				rec.mark  = items.mark;
				recs.push(rec);
			}
		}
		return recs;
	},
	
	_findRelated: function (source)
	{
		// console.time('_findRelated')
		
		var namesHash = source.getIngredientNames().hashIndex(),
			tagsHash = source.tags.hashIndex()
		
		var match = []
		
		var all = Cocktail.getAll()
		for (var i = 0, il = all.length; i < il; i++)
		{
			var cocktail = all[i]
			
			// kick out the source cocktail :)
			if (cocktail == source)
				continue
			
			var weight = 0
			
			// weight by ingredients
			var names = cocktail.ingredients
			for (var j = 0, jl = names.length; j < jl; j++)
				if (namesHash[names[j][0]])
					weight += 6
				else
					weight -= 1
			
			// forget it if there are no common ingredients
			if (weight <= 0)
				continue
			
			// weight by tags
			var tags = cocktail.tags
			for (var j = 0, jl = tags.length; j < jl; j++)
				if (tagsHash[tags[j]])
					weight += 2
			
			match.push(cocktail)
			cocktail.__relatedWeight = weight
		}
		
		match.sort(function (a, b) { return b.__relatedWeight - a.__relatedWeight })
		
		// console.timeEnd('_findRelated')
		
		return match
	},
	
	/**
	 * Нет ли бренда уже в списке рекомендуемых
	 * Проверяет первое слово в названиях
	 */
	_doesntHave: function(recs, name){
		for(var i = 0; i < recs.length; i++){
			if(recs[i].mark == name) return false;
		}
		return true;
	},
	
	getCocktailByName: function (name)
	{
		return Cocktail.getByName(name)
	}
}
