;(function(){

function Me () {}

Me.prototype =
{
	hashUpdated: function (hash)
	{
		this.model.setState(hash)
	},
	
	addMoreCocktails: function ()
	{
		this.model.addMoreCocktails()
	},
	
	onFiltersChanged: function (filters)
	{
		this.model.applyFilters()
	},
	
	onNameFilter: function(name){
		this.model.onNameFilter(name);
	},
	
	onPageChanged: function(num){
		this.model.onPageChanged(num);
	}
}

Papa.Controller = Me

})();