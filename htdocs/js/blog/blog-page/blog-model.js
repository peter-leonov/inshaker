;(function(){

function Me ()
{
	this.currentTag = null
}

Me.prototype =
{
	setPostsPerPage: function (count)
	{
		this.postsPerPage = count
	},
	
	setHash: function (hash)
	{
		this.setTag(hash.tag)
	},
	
	setTag: function (tag)
	{
		if (!tag)
			tag = 'all'
		
		if (this.currentTag == tag)
			return
		
		this.currentTag = tag
		
		this.view.switchTag(tag)
		
		this.addNewPosts()
		
		if (tag)
			Statistics.blogTagSelected(tag)
	},
	
	addNewPosts: function ()
	{
		this.iterator = Blog.Post.getPostsByTagIterator(this.currentTag)
		
		var view = this.view
		this.iterator(this.postsPerPage, function (posts, left) { view.renderNewPosts(posts, left) })
	},
	
	addMorePosts: function ()
	{
		var view = this.view
		this.iterator(this.postsPerPage, function (posts, left) { view.renderAddedPosts(posts, left) })
	},
	
	sendTags: function ()
	{
		this.view.eatAllTags(Blog.Post.getAllTags())
	}
}

Papa.Model = Me

})();
