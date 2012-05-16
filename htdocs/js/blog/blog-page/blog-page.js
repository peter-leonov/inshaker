;(function(){

<!--# include virtual="blog.js" -->

function onready ()
{
	
	var nodes =
	{
		root: $('common-main-wrapper'),
		postsLoop: $('posts-loop'),
		more: $('more'),
		tagCloud: $$('#tag-cloud .list')[0]
	}
	
	var widget = new BlogPage()
	widget.bind(nodes)
}

$.onready(onready)

})();
