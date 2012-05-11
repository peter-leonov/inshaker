;(function(){

function Me () {}

Me.prototype =
{
	addMorePosts: function ()
	{
		this.model.addMorePosts()
	},
	
	updateHash: function (hash)
	{
		this.model.updateHash(hash)
	}
}

Papa.Controller = Me

})();
