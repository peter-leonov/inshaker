Ingredient = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Ingredient.prototype =
{
	constructor: Ingredient
}

Object.extend(Ingredient,
{
	ingredients: [],
	groups: [],
	
	initialize: function (db_ingreds, db_groups){
		for(var i = 0; i < db_ingreds.length; i++){
			var ingred = new Ingredient(db_ingreds[i]);
			this.ingredients.push(ingred);
		}
		this.groups = db_groups;
	},
	
	byName: function (name){
		for(var i = 0; i < this.ingredients.length; i++){
			if(this.ingredients[i].name == name) return this.ingredients[i];
		}
	},
	
	byGroup: function(group){
		var res = [];
		for(var i = 0; i < this.ingredients.length; i++){
			if(this.ingredients[i].group == group) res.push(this.ingredients[i]);
		}
		return res;
	},
	
	getGroups: function(){
		return groups;
	}
})

Ingredient.initialize(<!--# include file="/db/ingredients.js"-->,<!--# include file="/db/ingredients_groups.js"-->)