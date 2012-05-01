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
		
		var byName = this.__byNameIndex = {}
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			byName[tag.name] = tag
		}
	},
	
	getByName: function (name)
	{
		return this.__byNameIndex[name]
	},
	
	allKeys: function (e)
	{
		var db = this.tagsDb
		
		var res = []
		for (var i = 0, il = db.length; i < il; i++)
			res[i] = db[i].key
		return res
	}
}

Object.extend(Me, myStatic)

Me.className = 'Blog'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/blog/tags.json" -->, <!--# include virtual="/db/blog/posts.json" -->)

})();
