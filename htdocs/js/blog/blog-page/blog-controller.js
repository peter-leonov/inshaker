;(function(){

function Me () {}

Me.prototype =
{
	renderPosts: function ()
	{
		this.model.renderPosts()
	},
	
	updateHash: function (hash)
	{
		this.model.updateHash(hash)
	}
}

Papa.Controller = Me

})();
