;(function(){

function Me () {}

Me.prototype =
{
	barmanNameFound: function (name)
	{
		this.model.setBarmanByName(name)
	}
}

Papa.Controller = Me

})();
