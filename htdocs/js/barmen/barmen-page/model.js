;(function(){

function Me () {}

Me.prototype =
{
	loadBarmen: function ()
	{
		var barmen = Barman.getAll()
		this.barmen = barmen
		this.view.modelChanged(barmen)
	}
}

Papa.Model = Me

})();