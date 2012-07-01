;(function(){

var Me =
{
	initialize: function (db)
	{
		this.db = db
	},
	
	bind: function ()
	{
		var db = this.db
		
		for (var k in db)
		{
			var item = db[k]
			if (!item.href)
				continue
			
			var node = $(k)
			if (node)
			{
				node.href = item.href
			}
		}
	}
}

var link = '/cocktail/mojito_home_strawberry/'

Me.initialize
({
	'#spotlighted':{'href':link},
	'#branded-image':{'href':link}
})

Me.bind()

})();
