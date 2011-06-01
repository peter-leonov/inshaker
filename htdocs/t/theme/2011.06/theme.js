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

Me.initialize
({
	"spotlighted":{"href":"/cocktail/home_margarita/"},
	"branded-image":{"href":"/cocktail/home_margarita/"}
})

Me.bind()

})();
