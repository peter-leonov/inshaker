;(function(){

function Me (data)
{
	this.name = data.name
	this.path = data.path
	this.portions = data.portions
	this.people = data.people
}

Me.staticMethods =
{
	initialize: function (db)
	{
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new Me(db[i])
		
		this.db = db
	},
	
	getByNameFirstRun: function (name)
	{
		this.indexByName()
		return this.getByName(name)
	},
	
	getByName: function (name)
	{
		return this._byNameIndex[name]
	},
	
	indexByName: function ()
	{
		this._byNameIndex = arrayToHash(this.db, 'name')
	},
	
	bakeFirstRun: function (name)
	{
		var real = this[name]
		var first = this[name + 'FirstRun']
		this[name] = function ()
		{
			this[name] = real
			return first.apply(this, arguments)
		}
	},
	
	findAndBakeFirstRuns: function ()
	{
		for (var k in this)
		{
			var name = k + 'FirstRun'
			var f = this[name]
			if (!f)
				continue
			this.bakeFirstRun(k)
		}
	}
}

Object.extend(Me, Me.staticMethods)
Me.findAndBakeFirstRuns()

Me.prototype =
{
	
}

Me.initialize(<!--# include file="/db/parties/parties.json" -->)

function arrayToHash (a, p)
{
	var hash = {}
	
	for (var i = 0, il = a.length; i < il; i++)
	{
		var v = a[i]
		hash[v[p]] = v
	}
	
	return hash
}

Me.className = 'Party'
self[Me.className] = Me

})();
