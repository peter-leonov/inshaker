;(function(){

function Me ()
{
	this.postPerPage = 20
	this.state = 0
	this.currentTag = ''
}

Me.prototype =
{
	addMorePosts: function (params)
	{
		var me = this,
			tag = params.tag,
			method = 'renderPosts'
			
		if (this.currentTag != tag)
			this.updateTag(tag)
		
		if (!this.state)
			method = 'renderNewPosts'
		
		Blog.getSomePostsByTag(this.state, this.state += this.postPerPage, this.currentTag, function (posts)
		{
			me.view[method](posts, me.getLeftCount())
		})
	},
	
	updateTag: function (tag)
	{
		this.state = 0
		this.currentTag = tag
		this.view.switchTag(Blog.getIndexByName(tag))
		
		if (tag)
			Statistics.blogTagSelected(tag)
	},
	
	getLeftCount: function ()
	{
		var count = Blog.getCountPostsByTag(this.currentTag)
		return count - this.state
	}
}

Papa.Model = Me

})();
