;(function(){

function Me () {}

Me.prototype =
{
	selectGoodByName: function (name)
	{
		// this.view.renderPreviews(Good.getAll())
		this.view.selectGood(Good.getByName(name))
	}
}

Papa.Model = Me

})();