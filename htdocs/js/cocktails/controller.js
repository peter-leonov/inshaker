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
	
	onTabSelected: function(name){
		this.model.setState(name);
	}
}

Papa.Controller = Me

})();