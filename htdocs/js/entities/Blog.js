;(function(){

function Me () {}

Me.prototype =
{
	
}

var myStatic =
{
	initialize: function (tags, posts)
	{
		this.index = {}
		this.tags = tags
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
	
	getSomePostsByTag: function (from, to, tag, callback)
	{
		var index = this.getIndexByTag()
		var posts = index[tag].slice(from, to)
		
		var total = 0
		for (var i = 0, il = posts.length; i < il; i++)
		{
			var post = posts[i]
			
			var me = this
			;(function(post){
				me.getPostSnippet(post, function(post)
				{
					if (++total >= il)
						callback(posts)
				})
			})(post)
		}
	},
	
	getPostSnippet: function(post, callback)
	{
		if (post.snippet)
		{
			callback(post)
		}
		else
		{
			Request.get('/blog/' + post.path + '/preview-snippet.html', null, function()
			{
				if (this.statusType == 'success')
				{
					post.snippet = this.responseText
					callback(post)
				}
			})
		}
	},
	
	getCountPostsByTag: function (tag)
	{
		if (!tag)
			return this.db.length
		else
			return this.getIndexByTag()[tag].length
	},
	
	getAllTags: function ()
	{
		return this.tags.slice()
	}
}

Object.extend(Me, myStatic)

Me.className = 'Blog'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/blog/tags.json" -->, <!--# include virtual="/db/blog/posts.json" -->)

})();
