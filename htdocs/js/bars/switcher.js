var Switcher =
{
	bind: function (main, tabs)
	{
		main.nodes = {tabs: tabs}
		
		main.onselect = function () {}
		main.select = function (num, node)
		{
			var tabs = this.nodes.tabs
			if (tabs)
			{
				for (var i = 0; i < tabs.length; i++)
					tabs[i].hide()
				tabs[num].show()
			}
		}
		
		
		function select (e)
		{
			var num
			for (var i = 0; i < this.childNodes.length; i++)
			{
				var node = main.childNodes[i]
				node.remClassName('selected')
				if (node == e.target)
					num = i
			}
			e.target.addClassName('selected')
			
			if (this.onselect(num, e.target) !== false)
				this.select(num, e.target)
		}
		main.addEventListener('mousedown', select, false)
		
		return main
	}
}
