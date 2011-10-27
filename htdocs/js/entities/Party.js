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
		this.db = db
	},
	
	getByNamePrepare: function (name)
	{
		this.indexByName()
	},
	
	getByName: function (name)
	{
		return this.bake(this._byNameIndex[name])
	},
	
	indexByName: function ()
	{
		this._byNameIndex = this.db.hashIndexKey('name')
	}
}

Object.extend(Me, DB)
Object.extend(Me, Me.staticMethods)
Me.findAndBakePrepares()

Me.prototype = {}

Me.initialize(<!--# include file="/db/parties/parties.json" -->)

Me.className = 'Party'
self[Me.className] = Me

})();
