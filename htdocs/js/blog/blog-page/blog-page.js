;(function(){

<!--# include virtual="blog.js" -->

function onready ()
{
	
	var nodes =
	{
		postsLoop: $('posts-loop')
	}
	
	var widget = new BlogPage()
	widget.bind(nodes)
}

$.onready(onready)

})();
