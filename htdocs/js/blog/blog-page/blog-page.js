;(function(){

<!--# include virtual="blog.js" -->

function onready ()
{
	
	var nodes =
	{
		pageRoot: $('common-main-wrapper')
	}
	
	var widget = new BlogPage()
	widget.bind(nodes)
}

$.onready(onready)

})();
