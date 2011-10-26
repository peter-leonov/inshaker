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
	
	getByName: function (name)
	{
		return this._byNameIndex[name]
	},
	
	getByNameFirstRun: function (name)
	{
		this.indexByName()
	},
	
	indexByName: function ()
	{
		this._byNameIndex = arrayToHash(this.db, 'name')
	},
	
	bakeFirstRuns: function ()
	{
		this[name + 'SecondRun'] = this[name]
		this[name] = function ()
		{
			var firstRun = this[name + 'FirstRun']
			firstRun.apply(this, arguments)
			
			var secondRun = this[name] = this[name + 'SecondRun']
			return secondRun.apply(this, arguments)
		}
	}
}

Object.extend(Me, Me.staticMethods)
Me.bakeFirstRun('getByName')

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
