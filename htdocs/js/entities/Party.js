;(function(){

function Me (data)
{
	this.name = data.name
	this.imperative = data.imperative
	this.path = data.path
	this.portions = data.portions
	this.people = data.people
	this.goods = data.goods || []
	this.hidden = data.hidden
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
	},
	
	getRandomPartiesIterator: function ()
	{
		var me = this
		
		var arr = this.db.slice()
		function iterator (n)
		{
			return me.bakeAry(arr.fetchRandom(n))
		}
		
		return iterator
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
