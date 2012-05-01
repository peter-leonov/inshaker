;(function(){

<!--# include virtual="blog.js" -->

function onready ()
{
	
	var nodes =
	{
		root: $('common-main-wrapper'),
		postsLoop: $('posts-loop'),
		more: $('more')
	}
	
	var widget = new BlogPage()
	widget.bind(nodes)
}

$.onready(onready)

})();
