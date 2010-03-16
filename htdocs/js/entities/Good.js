;(function(){

var myName = 'Good'

eval(NodesShortcut.include())

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
	this.constructor = Me
}

Me.prototype =
{
	getPreviewNode: function (lazy)
	{
		var link = Nct('a', lazy ? 'good-preview lazy' : 'good-preview', this.name)
		link.href = '/good/' + this.path + '/'
		link.style.backgroundImage = 'url(/good/' + this.path + '/mini.png)'
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