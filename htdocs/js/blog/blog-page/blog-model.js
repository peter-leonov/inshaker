;(function(){

function Me ()
{
	this.state = 0
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
		this.state = 0
		
		var view = this.view
		this.getMorePosts(function (posts, left) { view.renderNewPosts(posts, left) })
	},
	
	addMorePosts: function ()
	{
		var view = this.view
		this.getMorePosts(function (posts, left) { view.renderAddedPosts(posts, left) })
	},
	
	getMorePosts: function (f)
	{
		var from = this.state,
			to = this.state += this.postsPerPage
			
		var left = Blog.getPostsCountByTag(this.currentTag) - this.state
		Blog.getSomePostsByTag(from, to, this.currentTag, function (posts) { f(posts, left) })
	},
	
	sendTags: function ()
	{
		this.view.eatAllTags(Blog.getAllTags())
	}
}

Papa.Model = Me

})();
