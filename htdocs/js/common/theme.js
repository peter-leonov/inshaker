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

;(function(){ try {
	var m = /\btheme=(\d\d\d\d\.\d\d)/.exec(location.hash)
	if (m)
	{
		$('theme-stylesheet').href = '/t/theme/' + m[1] + '/theme.css'
		document.cookie = 'theme=' + m[1]// + '; expires=' + new Date()
	}
} catch (ex) {} })();
