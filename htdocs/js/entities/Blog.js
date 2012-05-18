;(function(){

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	loadSnippet: function(callback)
	{
		if (this.snippet)
		{
			setTimeout(callback, 0)
			return
		}
		
		Request.get('/blog/' + this.path + '/preview-snippet.html', null, function ()
		{
			if (this.statusType == 'success')
			{
				this.snippet = this.responseText
				callback()
			}
		})
	}
}

var myStatic =
{
	initialize: function (tags, posts)
	{
		this.index = {}
		this.tags = tags
		
		for (var i = 0, il = posts.length; i < il; i++)
			posts[i] = new Me(posts[i])
		
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
		
		var total = posts.length
		function gotOneSnippet ()
		{
			if (--total == 0)
				callback(posts)
		}
		
		for (var i = 0, il = posts.length; i < il; i++)
			posts[i].loadSnippet(gotOneSnippet)
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
