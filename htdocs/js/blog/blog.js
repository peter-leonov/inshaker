<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/location-hash.js" -->

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
		
		this.bakeStyles()
		this.setupVisibilityFrame()
		
		var lh = this.locationHash = new LocationHash().bind(window)
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
		tag = tag ? tag.key : 'all'
		this.switchTag(tag)
		this.renderPosts()
	},
	
	switchTag: function (tag)
	{
		var root = this.nodes.postsRoot
		
		root.removeClassName('show-' + this.lastTag)
		root.addClassName('show-' + tag)
		this.lastTag = tag
	},
	
	bakeStyles: function ()
	{
		var sheet = this.nodes.styleNode.sheet
		
		var tags = Blog.allKeys()
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			sheet.insertRule('#posts-loop.show-' + tag + ' .post.' + tag + ' { display: block }', i * 2)
			sheet.insertRule('#posts-loop.show-' + tag + ' .tag.' + tag + ' .link { color: inherit; cursor: text; text-decoration: none }', i *2 + 1)
		}
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
	var nodes =
	{
		lazyImages: $$('#posts-loop .post .body .image.lazy'),
		postsRoot: $('posts-loop'),
		styleNode: $('posts-selecter')
	}
	
	var widget = new BlogMainPage()
	widget.bind(nodes)
}

document.addEventListener('ready', onready, false)
