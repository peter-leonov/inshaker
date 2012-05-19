;(function(){

function Me (data, id)
{
	this.id = id
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	getRoot: function ()
	{
		return '/blog/' + this.path + '/'
	},
	
	loadSnippet: function(callback)
	{
		if (this.snippet)
		{
			// outer code expects async call back
			setTimeout(callback, 0)
			return
		}
		
		var post = this
		Request.get(this.getRoot() + 'preview-snippet.html', null, function ()
		{
			if (this.statusType == 'success')
			{
				post.snippet = this.responseText
				callback()
			}
		})
	}
}

var myStatic =
{
	initialize: function (posts, tags)
	{
		this.index = {}
		this.tags = tags
		
		for (var i = 0, il = posts.length; i < il; i++)
			posts[i] = new Me(posts[i], i)
		
		this.db = posts
	},
	
	getIndexByTag: function ()
	{
		var index = this.index.byTag
		if (index)
			return index
		
		index = this.index.byTag = DB.hashOfAryIndexByAryKey(this.db, 'tags')
		index['all'] = this.db.slice()
		return index
	},
	
	getPostsByTag: function (tag)
	{
		return this.getIndexByTag()[tag] || []
	},
	
	getPostsByTagIterator: function (tag)
	{
		var all = this.getPostsByTag(tag)
		
		var start = 0
		function iterator (count, callback)
		{
			var posts = all.slice(start, start + count)
			start += count
			
			var total = posts.length
			function gotOneSnippet ()
			{
				if (--total == 0)
					callback(posts, all.length - start)
			}
			
			for (var i = 0, il = posts.length; i < il; i++)
				posts[i].loadSnippet(gotOneSnippet)
		}
		
		return iterator
	},
	
	getPostsCountByTag: function (tag)
	{
		return this.getPostsByTag(tag).length
	},
	
	getAllTags: function ()
	{
		return this.tags.slice()
	}
}

Object.extend(Me, myStatic)

Me.className = 'Blog'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/blog/posts.json" -->, <!--# include virtual="/db/blog/tags.json" -->)

})();
