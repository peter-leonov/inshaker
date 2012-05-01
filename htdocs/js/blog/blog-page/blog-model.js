;(function(){

function Me () {}

Me.prototype =
{
	renderPosts: function ()
	{
		var posts = Blog.getSomePostsByTag(0, 20, '')
		this.view.renderPosts(posts)
	}
}

Papa.Model = Me

})();