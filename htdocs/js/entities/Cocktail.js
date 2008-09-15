Cocktail = function (data)
{
	for (var k in data) this[k] = data[k];
}

Object.extend(Cocktail,
{
	cocktails: [],
	tags: [],
	strengths: [],
	ingredients: [],
	letters: [],
	
	initialize: function (db){
		var i = 0;
		for (var k in db){
			var cocktail = new Cocktail(db[k]);
			this.cocktails[i++] = cocktail;
			
			var ingreds = cocktail.ingredients;
			for(var j = 0; j < ingreds.length; j++) {
				if(this.ingredients.indexOf(ingreds[j][0]) == -1) this.ingredients.push(ingreds[j][0])
			}
			
			var letter = cocktail.name.substr(0,1).toLowerCase();
			if(this.letters.indexOf(letter) == -1) this.letters.push(letter);
		}
		this.letters = this.letters.sort();
	},
	
	getByName: function (name){
		for(var i = 0; i < this.cocktails.length; i++){
			if(this.cocktails[i].name == name) return this.cocktails[i];
		}
	},
	
	getByLetter: function (letter, set){
		if(!set) set = this.cocktails;
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].name.match(reg)){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	getByTag: function (tag, set) {
		if(!set) set = this.cocktails;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	getByStrength: function(strength, set) {
		if(!set) set = this.cocktails;
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	},
	
	getByIngredients: function(ingredients, set) {
		if(!set) set = this.cocktails;
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
	
	getByFilters: function(filters){
		var res = [];
		var filtered = false;
		
		if(filters.letter){
			return Cocktail.getByLetter(filters.letter);
		}
		if(filters.tag) {
			res = Cocktail.getByTag(filters.tag);
			filtered = true;
		}
		if(filters.strength) {
			var to_filter = [];
			res = Cocktail.getByStrength(filters.strength, filtered ? res : null);
			filtered = true;
		}
		if(filters.ingredients) {
			var to_filter = [];
			res = Cocktail.getByIngredients(filters.ingredients, filtered ? res : null);
			filtered = true;
		}
		return res;
	}
})

Cocktail.initialize(<!--# include file="/db/cocktails.js" -->)
Cocktail.tags = <!--# include file="/db/tags.js" -->
Cocktail.strengths = <!--# include file="/db/strengths.js" -->