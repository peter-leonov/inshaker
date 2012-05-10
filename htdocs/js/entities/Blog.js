<!--# include virtual="/liby/modules/request.js"-->

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
		
		var byName = this.__byNameIndex = {},
			byIndex = this.__byIndexName = {}
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			byName[tag.name] = tag
			byIndex[tag.key] = tag
		}
		this.initDbKeys()
	},
	
	initDbKeys: function ()
	{
		var db = this.postDb,
			tags = this.tagsDb,
			dbKeys = this.dbKeys = {}
		
		for (var i = 0, il = tags.length; i < il; i++)
		{
			dbKeys[tags[i].name] = []
		}
		for (i = 0, il = db.length; i < il; i++)
		{
			for (var j = 0, jl = db[i].tags.length; j < jl; j++)
			{
				dbKeys[db[i].tags[j]].push(i)
			}
		}
	},
	
	getByName: function (name)
	{
		return this.__byNameIndex[name]
	},
	
	getByIndex: function (name)
	{
		return this.__byIndexName[name]
	},
	
	allKeys: function (e)
	{
		var db = this.tagsDb
		
		var res = []
		for (var i = 0, il = db.length; i < il; i++)
			res[i] = db[i].key
		return res
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
		function localCallback(post)
		{
			posts[j] = post
			if (++j == to-from)
				callback(posts)
		}
		
		for (var i = from; i < to; i++)
		{
			var post = this.postDb[dbKey[i]]

			;(function(post){
				if (post.html)
				{
					localCallback(post)
				}
				else
				{
					Request.get('/blog/' + post.path + '/preview-snippet.html', null, function()
					{
						if (this.statusType == 'success')
						{
							post.html = this.responseText
							localCallback(post)
						}
					})
				}
			})(post)
		}
	},
	
	getCountPostsByTag: function (tag)
	{
		if (!tag)
			return this.postDb.length
		else
			return this.dbKeys[tag].length
	}
}

Object.extend(Me, myStatic)

Me.className = 'Blog'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/blog/tags.json" -->, <!--# include virtual="/db/blog/posts.json" -->)

})();
