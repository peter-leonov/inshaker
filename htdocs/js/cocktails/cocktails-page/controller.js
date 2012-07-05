;(function(){

function Me () {}

Me.prototype =
{
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