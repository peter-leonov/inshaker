<!--# include virtual="/liby/core/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->

;(function(){

function Me ()
{
	this.nodes = []
	this.lastTag = 'all'
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.setupVisibilityFrame()
		
		var lh = this.locationHash = new LocationHash().bind()
		var me = this
		lh.addEventListener('change', function (e) { me.locationHashUpdated() }, false)
		
		this.locationHashUpdated()
	},
	
	renderPosts: function ()
	{
		this.updateVisibilityFrame(this.nodes.lazyImages)
		window.scrollTo(0, 0)
	},
	
	locationHashUpdated: function ()
	{
		var bookmark = UrlEncode.parse(this.locationHash.get())
		var tag = Blog.getByName(bookmark.tag)
		this.setTag(tag)
		this.renderPosts()
	},
	
	setTag: function (tag)
	{
		if (!tag)
		{
			this.switchTag('all')
			return
		}
		
		Statistics.blogTagSelected(tag.name)
		this.switchTag(tag.key)
	},
	
	switchTag: function (key)
	{
		var root = this.nodes.pageRoot
		
		root.removeClassName('show-' + this.lastTag)
		root.addClassName('show-' + key)
		this.lastTag = key
	},
	
	setupVisibilityFrame: function ()
	{
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(1000, 1000)
		
		var me = this
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node
					
					node.src = node.getAttribute('lazy-src')
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		var t = new Throttler(function (y) { frame.moveTo(0, y - 2500) }, 100, 500)
		window.addEventListener('scroll', function () { t.call(window.pageYOffset) }, false)
	},
	
	updateVisibilityFrame: function (images)
	{
		var boxes = Boxer.nodesToBoxes(images)
		
		var frame = this.frame
		frame.setBoxes(boxes)
	}
}

Me.className = 'BlogMainPage'
self[Me.className] = Me

})();


function onready (e)
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		lazyImages: $$('#posts-loop .post .body .image.lazy'),
		pageRoot: $('common-main-wrapper')
	}
	
	var widget = new BlogMainPage()
	widget.bind(nodes)
}

$.onready(onready)
