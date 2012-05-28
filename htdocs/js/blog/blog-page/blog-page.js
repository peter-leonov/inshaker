<!--# include virtual="/liby/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->
<!--# include virtual="/liby/modules/rus-date.js" -->

<!--# include virtual="/js/blog/tag-cloud.js" -->

;(function(){

<!--# include virtual="blog.js" -->

function onready ()
{
	var nodes =
	{
		root: $('#common-main-wrapper'),
		postsLoop: $('#posts-loop'),
		more: $('#more'),
		morePosts: $('#more .posts'),
		tagCloud: $('#tag-cloud .list')
	}
	
	var widget = new BlogPage()
	widget.bind(nodes)
	widget.setPostsPerPage(10)
	widget.guessState()
}

$.onready(onready)

})();
