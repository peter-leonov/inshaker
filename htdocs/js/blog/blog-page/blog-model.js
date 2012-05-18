;(function(){

function Me ()
{
	this.postPerPage = 10
	this.state = 0
	this.currentTag = null
}

Me.prototype =
{
	setHash: function (hash)
	{
		this.setTag(hash.tag)
	},
	
	setTag: function (tag)
	{
		if (this.currentTag == tag)
			return
		
		this.currentTag = tag
		
		this.view.switchTag(Blog.getIndexByName(tag))
		
		this.addNewPosts()
		
		if (tag)
			Statistics.blogTagSelected(tag)
	},
	
	addNewPosts: function ()
	{
		this.state = 0
		
		var from = this.state,
			to = this.state += this.postPerPage
			
		var left = this.getLeftCount()
		
		var view = this.view
		Blog.getSomePostsByTag(from, to, this.currentTag, function (posts)
		{
			view.renderNewPosts(posts, left)
		})
	},
	
	addMorePosts: function ()
	{
		var from = this.state,
			to = this.state += this.postPerPage
			
		var left = this.getLeftCount()
		
		var view = this.view
		Blog.getSomePostsByTag(from, to, this.currentTag, function (posts)
		{
			view.renderAddedPosts(posts, left)
		})
	},
	
	getLeftCount: function ()
	{
		var count = Blog.getCountPostsByTag(this.currentTag)
		return count - this.state
	}
}

Papa.Model = Me

})();
