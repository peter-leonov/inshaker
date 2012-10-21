;(function(){

eval(NodesShortcut.include())

var Me =
{
	initialize: function (data)
	{
		this.data = data
		this.files = {}
		this.index = {}
	},

}

Me.className = 'TopErrors'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/errors.json" -->)

})();