;(function(){

function Me ()
{
	this.state = 0
	this.currentTag = ''
	this.postPerPage = 20
}

Me.prototype =
{
	addMorePosts: function ()
	{
		var me = this
		Blog.getSomePostsByTag(this.state, this.state+=this.postPerPage, this.currentTag, function(posts)
		{
			me.view.renderPosts(posts)
		})
		this.updateLeftCount()
	},
	
	updateTag: function (tag)
	{
		this.state = 0
		this.currentTag = tag
		this.addMorePosts()
			
		this.view.switchTag(tag)
		
		Statistics.blogTagSelected(tag)
	},
	
	updateLeftCount: function ()
	{
		var count = Blog.getCountPostsByTag(this.currentTag),
			diff = count - this.state
		
		this.view.renderMoreButton(Math.min(diff, this.postPerPage))
	}
}

Papa.Model = Me

})();