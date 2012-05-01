;(function(){

function Me ()
{
	this.state = 0
	this.currentHash = ''
}

Me.prototype =
{
	renderPosts: function ()
	{
		var posts = Blog.getSomePostsByTag(this.state, this.state+=20, this.currentHash)
		this.view.renderPosts(posts)
	},
	
	updateHash: function (hash)
	{
		var tag = UrlEncode.parse(hash).tag,
			key = Blog.getByName(tag).key
			
		this.state = 0
		this.currentHash = key
		this.renderPosts()
			
		this.view.switchTag(key)
		
		Statistics.blogTagSelected(tag)
	}
}

Papa.Model = Me

})();