var Model = {
	ingredients: Cocktail.ingredients,
	resultSet: [],
	dataListener: null,
	
	init: function(){
		// this.cocktailsSet = Cocktail.getAll().sort(Cocktail.nameSort);
	},
	
	uniqueLetters: function(){
		return DataFilter.firstLetters(this.ingredients, false);
	},
	
	ingredientsOn: function(letter) {
		return DataFilter.ingredientsByLetter(this.ingredients, letter);
	},
	
    suitableIngredients: function(list){
		var res = [];
		var cocktails = Cocktail.getByIngredients(list);
		for(var i = 0; i < cocktails.length; i++){
			for(var j = 0; j < cocktails[i].ingredients.length; j++){
				res.push(cocktails[i].ingredients[j][0]);
			}
		}
		return [cocktails.length, res.uniq(), cocktails[0]];
	},

	selectedListChanged: function(selectedList){
		this.resultSet = this.suitableIngredients(selectedList);
		this.dataListener.updateCount(this.resultSet[0], this.resultSet[2], selectedList.length);
        
        // var rounds = Ingredient.getAllRoundsByNames(selectedList);
	    // this.dataListener.updateRounds(rounds, selectedList.length > 0);
    }
}
