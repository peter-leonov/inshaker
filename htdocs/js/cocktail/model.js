var Model = {
	cocktail: null,
	cocktailsSet: [],
	dataListener: null,
	recs: [], // recommendations
	
	init: function(name){
		this.cocktail = cocktails[name];
		this.cocktailsSet = toArray(cocktails);
		
		this.recs = this._findRecs(this.cocktail);
		if(this.recs.length == 0) this.dataListener.expandRelated();
	},
	
	_findRecs: function(cocktail){
		var recs = [];
		var ingreds = cocktail.ingredients; 
		
		for(var i = 0; i < ingreds.length; i++){
			var rec = goods[ingreds[i][0]];
			if(rec && rec[0].name != ""){
				var obj = {};
				if(ingreds[i][0] == rec[0].name) obj["text"] = rec[0].name;
				else obj["text"] = ingreds[i][0] + " " + rec[0].name;
				
				obj["image"] = rec[0].name.htmlName() + ".png";
				recs.push(obj);
			}
		}
		return recs;
	},
	
	getRelated: function(howMany){
		return DataFilter.relatedCocktails(this.cocktailsSet, this.cocktail, howMany);
	}
}