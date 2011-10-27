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
		this.index = {}
		this.db = db
	},
	
	getByNamePrepare: function (name)
	{
		this.index.byName = this.db.hashIndexKey('name')
	},
	
	getByName: function (name)
	{
		return this.bake(this.index.byName[name])
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
