;(function(){

eval(NodesShortcut.include())

function Me () {}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	modelChanged: function (barmen)
	{
		this.renderBarmen(barmen)
	},
	
	renderBarmen: function (barmen)
	{
		var tmp = document.createDocumentFragment()
		
		var previews = []
		for (var i = 0, il = barmen.length; i < il; i++)
		{
			var barman = barmen[i]
			
			var item = Nc('li', 'item')
			tmp.appendChild(item)
			
			var preview = previews[i] = Nc('a', 'barman-preview lazy')
			preview.barmanImageSrc = 'url(' + barman.getPhoto() + ')'
			preview.href = barman.pageHref()
			item.appendChild(preview)
			
			preview.appendChild(Nc('span', 'mask'))
			
			preview.appendChild(Nct('span', 'name', barman.name))
		}
		
		var list = this.nodes.barmensList
		list.empty()
		list.appendChild(tmp)
		
		this.setupVisibilityFrame(previews)
	},
	
	setupVisibilityFrame: function (nodes)
	{
		var boxes = Boxer.sameNodesToBoxes(nodes)
		var frame = new VisibilityFrame()
		frame.setFrame(4000, 1500)
		frame.setStep(500, 500)
		
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node,
						image = node.barmanImageSrc
					
					node.style.backgroundImage = image
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)
		
		function onscroll ()
		{
			frame.moveTo(window.pageXOffset, window.pageYOffset)
		}
		var timer
		window.addEventListener('scroll', function () { window.clearTimeout(timer); timer = window.setTimeout(onscroll, 100) }, false)
		onscroll()
	}
}

Papa.View = Me

})();
