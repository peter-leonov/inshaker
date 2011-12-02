function keyForValue(hash, value) {
  for(var key in hash) if(hash[key] == value) return key
  return null
}

function CocktailsController (states, cookies, model, view) {
	this.model = model;
	this.view	= view;
	
	this.hashTimeout = null;
	
	this.initialize = function () {
		this.view.controller = this;
	};
	
	this.onFiltersChanged = function (filters)
	{
		this.model.setFilters(filters)
	}
	
	this.onLetterFilter = function(letter, all) {
		this.model.onLetterFilter(letter, all);
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
	
	this.initialize();
};
