;(function(){

function Me () {}

Me.prototype =
{
	selectGoodByName: function (name)
	{
		this.model.selectGoodByName(name)
	}
}

Papa.Controller = Me

})();
