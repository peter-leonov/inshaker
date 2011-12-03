;(function(){

function Me () {}

Me.prototype =
{
	onFiltersChanged: function (filters)
	{
		this.model.setFilters(filters)
	},
	
	onLetterFilter: function(letter) {
		this.model.onLetterFilter(letter);
	},
	
	onNameFilter: function(name){
		this.model.onNameFilter(name);
	},
	
	onPageChanged: function(num){
		this.model.onPageChanged(num);
	},
	
	onStateChanged: function(num){
		this.model.onStateChanged(num);
	},
	
	needRandomCocktailNames: function(){
		return this.model.randomCocktailNames();
	}
}

Me.className = 'CocktailsController'
self[Me.className] = Me

})();