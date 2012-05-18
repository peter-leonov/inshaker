;(function(){

function Me () {}

Me.prototype =
{
	
}

var myStatic =
{
	initialize: function (tags, posts)
	{
		this.tags = tags
		this.db = posts
		
		this.initDbKeys()
	},
	
	initDbKeys: function ()
	{
		var db = this.db,
			tags = this.tags,
			dbKeys = this.dbKeys = {}
		
		for (var i = 0, il = tags.length; i < il; i++)
		{
			dbKeys[tags[i]] = []
		}
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			for (var j = 0, jl = db[i].tags.length; j < jl; j++)
			{
				dbKeys[db[i].tags[j]].push(i)
			}
		}
	},
	
	getSomePostsByTag: function (from, to, tag, callback)
	{
		var posts = [],
			dbKeys = this.dbKeys,
			dbKey = []
		
		if (!tag)
			for (var i = from, il = this.db.length; i < to && i < il; i++)
				dbKey[i] = i
		else
			dbKey = dbKeys[tag]
		
		to = Math.min(dbKey.length, to)
		
		var j = 0
		for (var i = from; i < to; i++)
		{
			var post = this.db[dbKey[i]],
				me = this
			
			;(function(i){
				me.getPostSnippet(post, function(post)
				{
					posts[i] = post
					if (++j == to-from)
						callback(posts)
				})
			})(i-from)
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
			return this.dbKeys[tag].length
	},
	
	getTagIndexByName: function (name)
	{
		return this.tags.indexOf(name)
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
