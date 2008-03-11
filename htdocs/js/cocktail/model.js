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
			var rec = goods[ingreds[i][0]];
			if(rec && rec[0].brand != ""){
				var obj = {};
				if(ingreds[i][0] == rec[0].brand) obj["text"] = rec[0].brand;
				else obj["text"] = ingreds[i][0] + " " + rec[0].brand;
				
				obj["banner"] = rec[0].brand.trans() + ".png";
				recs.push(obj);
			}
		}
		return recs;
	},
	
	getRelated: function(howMany){
		return DataFilter.relatedCocktails(this.cocktailsSet, this.cocktail, howMany);
	}
}