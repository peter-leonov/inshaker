;(function(){

var myName = 'Good'

eval(NodesShortcut.include())

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
	this.constructor = Me
}

function lazyLoad ()
{
	var url = this.lazyBackgroundImage
	if (url)
	{
		this.lazyBackgroundImage = null
		this.style.backgroundImage = url
		this.removeClassName('lazy')
	}
}

Me.prototype =
{
	getPreviewNode: function (lazy)
	{
		var link = Nct('a', lazy ? 'good-preview lazy' : 'good-preview', this.name)
		link.href = '/good/' + this.path + '/'
		var backgroundImage = 'url(/good/' + this.path + '/mini.png)'
		if (lazy)
			link.lazyBackgroundImage = backgroundImage
		else
			link.style.backgroundImage = backgroundImage
		
		link.lazyLoad = lazyLoad
		
		return link
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
	},
	
	getAll: function ()
	{
		// save the db from corruption with copying
		return this.db.slice()
	}
}

Object.extend(Me, staticMethods)

Me.className = myName
self[myName] = Me

Me.initialize(<!--# include file="/db/goods.js"-->)

})();