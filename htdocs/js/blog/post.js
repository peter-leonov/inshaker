<!--# include virtual="/liby/modules/interpolate.js" -->
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
		
		var share = new ShareBox()
		share.bind(nodes.shareBox)
		share.render(window.location.href, 'Супер блог: ' + nodes.title.getAttribute('data-title'))
	}
}

Me.className = 'BlogPostPage'
self[Me.className] = Me

})();


function onready (e)
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		title: $$('#the-one .post .title')[0],
		shareBox:
		{
			root: $('#share-box'),
			buttons: $$('#share-box .button')
		}
	}
	
	var widget = new BlogPostPage()
	widget.bind(nodes)
}

$.onready(onready)
