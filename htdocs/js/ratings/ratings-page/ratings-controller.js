;(function(){

function Me () {}

Me.prototype =
{
	changeHashReaction: function (hash)
	{
		this.model.setState(hash)
	}
}

Papa.Controller = Me

})();
