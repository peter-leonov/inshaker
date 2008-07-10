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
			
			var childs = Array.copy(this.childNodes)
			
			var selected = childs[num]
			if (selected)
			{
				for (var i = 0; i < childs.length; i++)
					childs[i].remClassName('selected')
				
				selected.addClassName('selected')
			}
			
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
			var childs = Array.copy(main.childNodes)
			var num
			for (var i = 0; i < childs.length; i++)
				if (childs[i] == e.target)
					num = i
			
			if (this.onselect(num, e.target) !== false && this.autoSelect)
				this.select(num, e.target)
		}
		main.addEventListener('mousedown', select, false)
		
		return main
	}
}
