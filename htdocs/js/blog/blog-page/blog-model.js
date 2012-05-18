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
		
		var view = this.view
		this.getMorePosts( function (posts, left) { view.renderNewPosts(posts, left) })
	},
	
	addMorePosts: function ()
	{
		var view = this.view
		this.getMorePosts( function (posts, left) { view.renderAddedPosts(posts, left) })
	},
	
	getMorePosts: function (f)
	{
		var from = this.state,
			to = this.state += this.postPerPage
			
		var left = Blog.getCountPostsByTag(this.currentTag) - this.state
		Blog.getSomePostsByTag(from, to, this.currentTag, function (posts) { f(posts, left) })
	}
}

Papa.Model = Me

})();
