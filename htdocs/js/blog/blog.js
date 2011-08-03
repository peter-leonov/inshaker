;(function(){

function Me ()
{
	var nodes = []
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.setupVisibilityFrame(nodes.lazyImages)
	},
	
	setupVisibilityFrame: function (images)
	{
		var boxes = Boxer.nodesToBoxes(images)
		
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(1000, 1000)
		frame.moveTo(0, -2500)
		
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
		
		frame.setBoxes(boxes)
		
		var t = new Throttler(function (y) { frame.moveTo(0, y - 2500) }, 100, 500)
		window.addEventListener('scroll', function () { t.call(window.pageYOffset) }, false)
	}
}

Me.className = 'BlogMainPage'
self[Me.className] = Me

})();


function onready (e)
{
	var nodes =
	{
		lazyImages: $$('#posts-loop .post .body .image.lazy')
	}
	
	var widget = new BlogMainPage()
	widget.bind(nodes)
}

document.addEventListener('ready', onready, false)
