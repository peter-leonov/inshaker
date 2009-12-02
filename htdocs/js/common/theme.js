// Class
;(function(){

var myName = 'Theme'
var Me = self[myName] =
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
				// fix for cocktails initialization issue
				// node.addEventListener('click', function() { window.location.href = this.href; window.location.reload(true)}, false)
			}
		}
	}
}

<!--# if expr="$cookie_theme" -->
Me.initialize(<!--# include virtual="/t/theme/$cookie_theme/theme.js" -->)
<!--# else -->
<!--# config timefmt="%Y.%m" -->
Me.initialize(<!--# include virtual="/t/theme/$date_local/theme.js" -->)
<!--# endif -->

})();
