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
	"spotlighted":{"href":"/combinator.html#q=%D0%92%D0%BE%D0%B4%D0%BA%D0%B0%20%D0%B2%D0%B0%D0%BD%D0%B8%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F"},
	"branded-image":{"href":"/combinator.html#q=%D0%92%D0%BE%D0%B4%D0%BA%D0%B0%20%D0%B2%D0%B0%D0%BD%D0%B8%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F"}
})

Me.bind()

})();
