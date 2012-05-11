;(function(){

function Me ()
{
	this.state = 0
	this.currentHash = ''
	this.postPerPage = 20
}

Me.prototype =
{
	addMorePosts: function ()
	{
		var me = this
		Blog.getSomePostsByTag(this.state, this.state+=this.postPerPage, this.currentHash, function(posts)
		{
			me.view.renderPosts(posts)
		})
		this.updateLeftCount()
	},
	
	updateHash: function (hash)
	{
		var tag = UrlEncode.parse(hash).tag
			
		this.state = 0
		this.currentHash = tag
		this.addMorePosts()
			
		this.view.switchTag(tag)
		
		Statistics.blogTagSelected(tag)
	},
	
	updateLeftCount: function ()
	{
		var count = Blog.getCountPostsByTag(this.currentHash),
			diff = count - this.state
		
		this.view.renderMoreButton(Math.min(diff, this.postPerPage))
	}
}

Papa.Model = Me

})();