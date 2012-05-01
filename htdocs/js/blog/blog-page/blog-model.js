;(function(){

function Me ()
{
	this.state = 0
}

Me.prototype =
{
	renderPosts: function ()
	{
		var posts = Blog.getSomePostsByTag(this.state, this.state+=20, '')
		this.view.renderPosts(posts)
	}
}

Papa.Model = Me

})();