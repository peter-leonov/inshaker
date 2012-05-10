;(function(){

function Me ()
{
	this.state = 0
	this.currentHash = ''
	this.postPerPage = 20
}

Me.prototype =
{
	renderPosts: function ()
	{
		var me = this
		Blog.getSomePostsByTag(this.state, this.state+=this.postPerPage, this.currentHash, function(posts)
		{
			me.view.renderPosts(posts)
		})
		this.updateMoreButton()
	},
	
	updateHash: function (hash)
	{
		var tag = UrlEncode.parse(hash).tag
			
		this.state = 0
		this.currentHash = tag
		this.renderPosts()
			
		this.view.switchTag(tag)
		
		Statistics.blogTagSelected(tag)
	},
	
	updateMoreButton: function ()
	{
		var count = Blog.getCountPostsByTag(this.currentHash),
			diff = count - this.state
		
		if (diff < 1)
			this.view.hideMoreButton()
		else
			this.view.renameMoreButton(diff > this.postPerPage ? this.postPerPage : diff)
	}
}

Papa.Model = Me

})();