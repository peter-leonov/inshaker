// Class
;(function(){

var myName = 'Theme'
var Me = self[myName] =
{
	initialize: function (db)
	{
		this.db = db
		log(db)
	},
	
	bind: function ()
	{
		var db = this.db
		
		var spotlighted = $('spotlighted')
		if (spotlighted)
			spotlighted.href = db['spotlighted'].href
		
		var image = $('branded-image')
		if (image)
			image.href = db['branded-image'].href
	}
}

<!--# if expr="$cookie_theme" -->
Me.initialize(<!--# include virtual="/t/theme/$cookie_theme/theme.js" -->)
<!--# else -->
<!--# config timefmt="%Y.%m" -->
Me.initialize(<!--# include virtual="/t/theme/$date_local/theme.js" -->)
<!--# endif -->

})();
