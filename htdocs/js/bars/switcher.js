var Switcher =
{
	bind: function (main, tabs)
	{
		main.nodes = {tabs: tabs}
		main.names = []
		
		main.autoSelect = true
		main.onselect = function () {}
		main.setTabs = function (tabs) { this.nodes.tabs = tabs }
		main.setNames = function (names) { this.names = names }
		main.select = function (num)
		{
			if (typeof num != 'Number')
				num = this.names.indexOf(num)
			
			var tabs = this.nodes.tabs
			if (tabs && tabs[num])
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
			
			if (this.onselect(num, e.target) !== false && this.autoSelect)
				this.select(num, e.target)
		}
		main.addEventListener('mousedown', select, false)
		
		return main
	}
}
