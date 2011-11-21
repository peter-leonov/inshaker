;(function(){

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
	
	this.unit = 'шт'
	this.volumes = [[1, 1]]
}

Me.prototype =
{
	pageHref: function () { return '/tool/' + this.path },
	getMiniImageSrc: function () { return this.pageHref() + '/preview.jpg' },
	imgSrc: function () { return this.pageHref() + '/image.png' },
	
	getCost: function (anount)
	{
		var best = this.volumes[0]
		return anount * best[1] / best[0]
	}
}

Me.staticMethods =
{
	db: null,
	index: {},
	
	initialize: function (db)
	{
		this.db = db
		
		for (var i = 0; i < db.length; i++)
			db[i] = new Tool(db[i])
	},
	
	getByNamePrepare: function (name)
	{
		this.index.byName = DB.hashIndexKey(this.db, 'name')
	},
	
	getByName: function (name)
	{
		return this.index.byName[name]
	}
}

Object.extend(Me, DB.module.staticMethods)
Object.extend(Me, Me.staticMethods)
Me.findAndBindPrepares()

Me.className = 'Tool'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/tools/tools.json" -->)

})();
