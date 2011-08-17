<!--# include virtual="/js/common/share-box.js" -->

;(function(){

function Me ()
{
	this.nodes = []
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		
	}
}

Me.className = 'BlogPostPage'
self[Me.className] = Me

})();


function onready (e)
{
	var nodes =
	{
		shareBox: $('share-box')
	}
	
	var widget = new BlogPostPage()
	widget.bind(nodes)
}

document.addEventListener('ready', onready, false)
