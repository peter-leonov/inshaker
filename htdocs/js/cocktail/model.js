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
	
	_findRelated: function (cocktail)
	{
		var res = []
		
		console.time('_findRelated')
		
		
		
		console.timeEnd('_findRelated')
		
		
		
		
		
		return res
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
