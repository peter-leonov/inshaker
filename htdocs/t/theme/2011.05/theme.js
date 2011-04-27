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
	"spotlighted":{"href":"/combinator.html#q=ABSOLUT%20shooters"},
	"branded-image":{"href":"/combinator.html#q=ABSOLUT%20shooters"}
})

Me.bind()

})();
