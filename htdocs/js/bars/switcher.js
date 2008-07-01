var Switcher =
{
	init: function (main, tabs)
	{
		this.main = main
		this.tabs = tabs
		var t = this
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
			
			if (t.onselect)
			{
				if (this.onselect(num, e.target) !== false)
					t.select(num, e.target)
			}
			else
				t.select(num, e.target)
		}
		main.addEventListener('mousedown', select, false)
	},
	
	select: function (num, node)
	{
		var tabs = this.tabs
		if (tabs)
		{
			for (var i = 0; i < tabs.length; i++)
				tabs[i].hide()
			tabs[num].show()
		}
	}
}
