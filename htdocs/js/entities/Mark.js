;(function(){

var myName = 'Mark'

eval(NodesShortcut.include())

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
	this.constructor = Me
}

Me.prototype =
{
	pageHref: function ()
	{
		return '/mark/' + this.path + '/'
	},
	
	getBannerSrc: function (lazy)
	{
		return this.pageHref() + 'banner.png'
	}
}

var staticMethods =
{
	initialize: function (db)
	{
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new Me(db[i])
		
		this.db = db
	},
	
	byNameIndex: null,
	getByName: function (name)
	{
		var index = this.byNameIndex
		if (!index)
		{
			index = this.byNameIndex = {}
			
			var db = this.db
			for (var i = 0, il = db.length; i < il; i++)
			{
				var item = db[i]
				index[item.name] = item
			}
		}
		
		return index[name]
	}
}

Object.extend(Me, staticMethods)

Me.className = myName
self[myName] = Me

Me.initialize(<!--# include file="/db/marks.js"-->)

})();