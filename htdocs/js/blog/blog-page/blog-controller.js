;(function(){

function Me () {}

Me.prototype =
{
	renderPosts: function ()
	{
		this.model.renderPosts()
	}
}

Papa.Controller = Me

})();
