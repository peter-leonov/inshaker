;(function(){

function Me () {}

Me.prototype =
{
	
}

var myStatic =
{
	initialize: function (tags, posts)
	{
		this.tagsDb = tags
		this.postDb = posts
		
		this.initDbKeys()
	},
	
	initDbKeys: function ()
	{
		var db = this.postDb,
			tags = this.tagsDb,
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
			for (var i = from, il = this.postDb.length; i < to && i < il; i++)
				dbKey[i] = i
		else
			dbKey = dbKeys[tag]
		
		to = Math.min(dbKey.length, to)
		
		var j = 0
		for (var i = from; i < to; i++)
		{
			var post = this.postDb[dbKey[i]],
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
		if (post.html)
		{
			callback(post)
		}
		else
		{
			Request.get('/blog/' + post.path + '/preview-snippet.html', null, function()
			{
				if (this.statusType == 'success')
				{
					post.html = this.responseText
					callback(post)
				}
			})
		}
	},
	
	getCountPostsByTag: function (tag)
	{
		if (!tag)
			return this.postDb.length
		else
			return this.dbKeys[tag].length
	},
	
	getIndexByName: function (name)
	{
		return this.tagsDb.indexOf(name)
	},
	
	getTagsDB: function ()
	{
		return this.tagsDb 
	}
}

Object.extend(Me, myStatic)

Me.className = 'Blog'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/blog/tags.json" -->, <!--# include virtual="/db/blog/posts.json" -->)

})();
