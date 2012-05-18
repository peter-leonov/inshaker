<!--# include virtual="/liby/core/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->
<!--# include virtual="/liby/modules/rus-date.js" -->

;(function(){

<!--# include virtual="blog.js" -->

function onready ()
{
	var nodes =
	{
		root: $('#common-main-wrapper'),
		postsLoop: $('#posts-loop'),
		more: $('#more'),
		tagCloud: $('#tag-cloud .list')
	}
	
	var widget = new BlogPage()
	widget.bind(nodes).guessState()
}

$.onready(onready)

})();
