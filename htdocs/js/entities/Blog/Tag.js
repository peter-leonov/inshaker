;(function(){

function Me () {}

var myStatic =
{
	initialize: function (db)
	{
		this.db = db
	},
	
	getAll: function ()
	{
		return this.db.slice()
	}
}

Object.extend(Me, myStatic)

Me.className = 'Tag'
Blog[Me.className] = Me

Me.initialize(<!--# include virtual="/db/blog/tags.json" -->)

})();
