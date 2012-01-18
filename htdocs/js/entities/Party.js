;(function(){

function Me (data)
{
	this.name = data.name
	this.path = data.path
	this.portions = data.portions
	this.people = data.people
	this.goods = data.goods || []
}

Me.staticMethods =
{
	initialize: function (db)
	{
		this.index = {}
		this.db = db
	},
	
	getByNamePrepare: function ()
	{
		this.index.byName = DB.hashIndexKey(this.db, 'name')
	},
	
	getByName: function (name)
	{
		return this.bake(this.index.byName[name])
	}
}

Object.extend(Me, DB.module.staticMethods)
Object.extend(Me, Me.staticMethods)
Me.findAndBindPrepares()

Me.prototype = {}

Me.initialize(<!--# include file="/db/parties/parties.json" -->)

Me.className = 'Party'
self[Me.className] = Me

})();
