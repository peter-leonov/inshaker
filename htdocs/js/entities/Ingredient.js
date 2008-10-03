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
	
	getByName: function (name){
		for(var i = 0; i < this.ingredients.length; i++){
			if(this.ingredients[i].name.toLowerCase() == name.toLowerCase())
        return this.ingredients[i];
		}
	},
	
	getByGroup: function(group){
		var res = [];
		for(var i = 0; i < this.ingredients.length; i++){
			if(this.ingredients[i].group == group) res.push(this.ingredients[i]);
		}
		return res;
	},
	
	sortByGroups: function(a, b){
		var self = Ingredient;
    if(typeof a == 'object') { a = a[0]; b = b[0] }

		if(self.groups.indexOf(self.getByName(a).group) > 
			self.groups.indexOf(self.getByName(b).group)) return 1;
		else return -1;
	}
})

Ingredient.initialize(<!--# include file="/db/ingredients.js"-->,<!--# include file="/db/ingredients_groups.js"-->)
