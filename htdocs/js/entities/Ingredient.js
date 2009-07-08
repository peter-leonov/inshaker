Ingredient = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Ingredient.prototype =
{
	constructor: Ingredient,
    getRound: function() { return Ingredient.rounds[this.name] },
    listOrder: function () { return Ingredient.groups.indexOf(this.group) },
    
    updateRound: function(mark, show) {
        var round = this.getRound();

        if(round == 0) round = "Ok";
        else if(round) round = "+" + round;

        mark.innerHTML = round || "";
        mark.setVisible(show)
    }
}

Object.extend(Ingredient,
{
	ingredients: [],
	groups: [],
    rounds: {},
	
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
	
    getAllRoundsByNames: function(names){
        var cocktails = Cocktail.getByIngredients(names);
        var cRounds = Cocktail.rounds;

        for (var i = 0; i < cocktails.length; i++){
            var cName    = cocktails[i].name;
            var cIngreds = cocktails[i].ingredients;
            for(var j = 0; j < cIngreds.length; j++){
                if(!this.rounds[cIngreds[j][0]] || this.rounds[cIngreds[j][0]] > cRounds[cName])
                    this.rounds[cIngreds[j][0]] = cRounds[cName];
            }
        }
        return this.rounds;
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
