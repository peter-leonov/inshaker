;(function(){

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
}

Me.prototype =
{
	imgSrc: function ()
	{
		return '/i/merchandise/tools/' + this.name.trans() + '.png'
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
