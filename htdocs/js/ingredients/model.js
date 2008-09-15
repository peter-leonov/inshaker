var Model = {
	ingredients: Cocktail.ingredients,
	resultSet: [],
	dataListener: null,
	
	init: function(){
		this.cocktailsSet = Cocktail.cocktails.sort(DataFilter.nameSort);
	},
	
	uniqueLetters: function(){
		return DataFilter.firstLetters(this.ingredients, false);
	},
	
	ingredientsOn: function(letter) {
		return DataFilter.ingredientsByLetter(this.ingredients, letter);
	},
	
	selectedListChanged: function(selectedList){
		this.resultSet = DataFilter.suitableIngredients(this.cocktailsSet, selectedList);
		this.dataListener.updateSuitable(this.resultSet[1]);
		
		var num = this.resultSet[0];
		if(num == this.cocktailsSet.length) num = 0;
		this.dataListener.updateCount(num, this.resultSet[2]);
	}
}