;(function(){

function Me () {}

Me.prototype =
{
	setBarmanByName: function (name)
	{
		var barman = Barman.getByName(name)
		this.barman = barman
		
		var neighbours = Barman.getPrevNext(barman)
		this.view.modelChanged(barman, neighbours)
	}
}

Papa.Model = Me

})();
