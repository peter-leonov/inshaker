function CocktailsController () {
	this.onFiltersChanged = function (filters)
	{
		this.model.setFilters(filters)
	}
	
	this.onLetterFilter = function(letter) {
		this.model.onLetterFilter(letter);
	};
	
	this.onNameFilter = function(name){
		this.model.onNameFilter(name);
	};
	
	this.onPageChanged = function(num){
		this.model.onPageChanged(num);
	};
	
	this.onStateChanged = function(num){
		this.model.onStateChanged(num);
	}
	
	this.needRandomCocktailNames = function(){
		return this.model.randomCocktailNames();
	};
};
