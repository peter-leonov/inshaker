// TODO: Wrap it in those cute objects like you did with other entities
function Event (data)
{
	for (var k in data)
		this[k] = data[k]
	
	this.date = new Date(data.date)
}

Event.prototype =
{
	pageHref: function ()
	{
		return '/event/' + this.href + '/'
	}
}

Object.extend(Event,
{
	db: null, // must be defined in db-events.js by calling initialize()
	indices: {},
	
	initialize: function (hash)
	{
		var db = []
		
		for (var k in hash)
			db.push(new Event(hash[k]))
		
		this.db = db
	},
	
	indexBy: function (prop)
	{
		if (this.indices[prop])
			return
		
		var db = this.db,
			index = {}
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var entity = db[i],
				val = entity[prop]
			
			var arr = index[val]
			if (arr)
				arr.push(entity)
			else
				index[val] = [entity]
		}
		
		this.indices[prop] = index
	},
	
	getByNameIndexed: function (name)
	{
		return this.indices.name[name]
	},
	getByName: function (name)
	{
		this.indexBy('name')
		this.getByName = this.getByNameIndexed
		return this.getByName(name)
	},
	
	getNames: function ()
	{
		var db = this.db,
			res = []
		
		for (var i = 0, il = db.length; i < il; i++)
			res.push(db[i].name)
		
		return res
	},
	
	getAll: function ()
	{
		return this.db.slice()
	},
	
	getByType: function (type)
	{
		this.indexBy('type')
		return this.indices.type[type]
	},
	
	dateSort: function (a, b)
	{
		return a.date - b.date
	}
})

Event.initialize(<!--# include file="/db/events.js" -->)