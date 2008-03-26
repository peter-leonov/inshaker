var Model = {
	cocktail: null,
	ingredients: [],
	goods: goods,
	
	cocktailsSet: [],
	dataListener: null,
	
	recs: [], // recommendations
	
	init: function(name){
		this.cocktail = cocktails[name];
		this.cocktailsSet = toArray(cocktails);
		this.ingredients = this.cocktail.ingredients;
		
		this.recs = this._findRecs(this.cocktail);
		if(this.recs.length == 0) this.dataListener.expandRelated();
	},
	
	_findRecs: function(cocktail){
		var recs = [];
		var ingreds = cocktail.ingredients; 
		
		for(var i = 0; i < ingreds.length; i++){
			var items = goods[ingreds[i][0]];
			if(items && items[0].mark != "" && this._doesntHave(recs, items[0].mark)){
				var rec = {};
				rec.mark  = items[0].mark;
				rec.banner = items[0].mark.trans() + ".png";
				recs.push(rec);
			}
		}
		return recs;
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
	
	getRelated: function(howMany){
		return DataFilter.relatedCocktails(this.cocktailsSet, this.cocktail, howMany);
	}
}