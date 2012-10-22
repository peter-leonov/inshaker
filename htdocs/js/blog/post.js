<!--# include virtual="/liby/modules/interpolate.js" -->
<!--# include virtual="/js/common/share-box.js" -->

<!--# include virtual="/js/blog/tag-cloud.js" -->

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
		
		var tagCloud = new TagCloud({root: nodes.tagCloud})
		tagCloud.setTags(Blog.Tag.getAll())
		tagCloud.render()
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
		title: $('#the-one .post .title'),
		shareBox:
		{
			root: $('#share-box'),
			buttons: $$('#share-box .button')
		},
		tagCloud: $('#tag-cloud .list')
	}
	
	var widget = new BlogPostPage()
	widget.bind(nodes)
}

$.onready(onready)
