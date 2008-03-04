var DataFilter = {
	suitableIngredients: function(set, list){
		var res = [];
		var cocktails = this.cocktailsByIngredients(set, list);
		for(var i = 0; i < cocktails.length; i++){
			for(var j = 0; j < cocktails[i].ingredients.length; j++){
				res.push(cocktails[i].ingredients[j][0]);
			}
		}
		return [cocktails.length, res.uniq(), cocktails[0]];
	},
	
	ingredientsByLetter: function(set, letter){
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].match(reg)){
				res.push(set[i]);
			}
		}
		return res;		
	},
		
	cocktailsByLetter: function (set, letter){
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].name.match(reg)){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	cocktailsByTag: function (set, tag) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	cocktailsByStrength: function(set, strength) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	},
	
	cocktailsByIngredients: function(set, ingredients) {
		var res = [];
		for(var i = 0; i < set.length; i++) {
			var good = 0;
			for(var j = 0; j < set[i].ingredients.length; j++) {
				for(var k = 0; k < ingredients.length; k++){
					if(set[i].ingredients[j][0] == ingredients[k]) good++;
				}
			}
			if(good == ingredients.length) res.push(set[i]);
		}
		return res;
	},
	
	nameSort: function(a, b){
		if(a.name > b.name) return 1;
		else if(a.name == b.name) return 0;
		else return -1;
	}
}