;(function(){

var myName = 'Autocompleter'
var Me = self[myName] = MVC.create(myName)

Me.prototype.extend
({
	bind: function (main)
	{
		this.view.bind({main:main})
		return this
	},
	
	setDataSource: function (ds) { this.model.dataSource = ds },
	setCount: function (v) { this.model.count = v },
	setInstant: function (v) { this.view.instant = v }
})

// Me.mixIn(EventDriven)

eval(NodesShortcut())

var VK_TAB = 9, VK_ENTER = 13, VK_ESC = 27, VK_PGUP = 33, VK_PGDN = 34, VK_END = 35,
	VK_HOME = 36, VK_LEFT = 37, VK_UP = 38, VK_RIGHT = 39, VK_DOWN = 40

Me.View.prototype.extend
({
	initialize: function ()
	{
		this.nodes = {}
		this.chache = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		var main = nodes.main
		main.setAttribute('autocomplete', 'off')
		
		var list = this.nodes.list = N('ul')
		list.className = 'autocomplete'
		main.parentNode.appendChild(list)
		
		var me = this
		main.addEventListener('blur', function (e) { me.onBlur(e) }, false)
		main.addEventListener('keypress', function (e) { me.onKeyPress(e) }, false)
		list.addEventListener('mousedown', function (e) { me.onMouseDown(e) }, false)
		list.addEventListener('mousemove', function (e) { me.onMouseMove(e) }, false)
	},
	
	onKeyPress: function (e)
	{
		var targ = e.target
		var controller = this.controller
		
		switch (e.keyCode)
		{
			case VK_UP:
				controller.goUp(targ.value)
				e.preventDefault()
				e.stopPropagation()
			break
			
			case VK_DOWN:
				controller.goDown(targ.value)
				e.preventDefault()
				e.stopPropagation()
			break
			
			case VK_ESC:
				controller.goEscape(targ.value)
				e.preventDefault()
				e.stopPropagation()
			break
			
			case VK_ENTER:
				if (this.active)
				{
					controller.goEnter(targ.value)
					if (!this.instant)
					{
						e.preventDefault()
						e.stopPropagation()
					}
				}
			break
			
			default:
				setTimeout(function () { controller.valueUpdated(targ.value) }, 1)
		}
	},
	
	onBlur: function (e)
	{
		this.controller.goBlur()
	},
	
	onMouseMove: function (e)
	{
		var index = Array.copy(this.nodes.list.childNodes).indexOf(e.target)
		this.controller.itemHovered(index)
	},
	
	onMouseDown: function (e)
	{
		var index = Array.copy(this.nodes.list.childNodes).indexOf(e.target)
		this.controller.itemClicked(index)
	},
	
	renderVariant: function (str)
	{
		this.nodes.main.value = str
	},
	
	renderResults: function (valsSet)
	{
		this.updateNodes(valsSet)
		valsSet.length ? this.show() : this.hide()
	},
	
	show: function ()
	{
		var main = this.nodes.main
		var list = this.nodes.list
		
		list.style.top = (main.offsetTop + main.offsetHeight) + 'px'
		list.style.width = (main.offsetWidth - 2) + 'px'
		
		list.show()
		
		this.active = true
	},
	
	hide: function ()
	{
		this.nodes.list.hide()
		
		this.active = false
	},
	
	updateNodes: function (valsSet)
	{
		var list = this.nodes.list
		list.empty()
		for (var i = 0; i < valsSet.length; i++)
		{
			var val = valsSet[i]
			var item = this.chache[val]
			if (!item)
			{
				var item = N('li')
				item.className = 'item'
				item.appendChild(T(val))
				this.chache[val] = item
			}
			list.appendChild(item)
		}
		
		this.selectVariant()
	},
	
	selectVariant: function (num)
	{
		var childs, list
		if ((list = this.nodes.list) && (childs = Array.copy(list.childNodes)))
		{
			for (var i = 0; i < childs.length; i++)
				childs[i].removeClassName('selected')
			
			var node = childs[num]
			if (node)
				node.addClassName('selected')
		}
	}
})

Me.Controller.prototype.extend
({
	initialize: function ()
	{
		this.vals = []
		this.value = ''
		this.selected = -1
	},
	
	resetSelector: function ()
	{
		this.view.renderResults([])
		this.vals = []
		this.value = ''
		this.selected = -1
	},
	
	beginSearch: function (value)
	{
		this.resetSelector()
		
		var vals = this.model.search(value)
		if (vals.length == 1 && vals[0] == value)
			vals.shift()
		this.view.renderResults(vals)
		this.vals = vals
		this.value = value
	},
	
	valueUpdated: function (value)
	{
		if (this.lastValue != value)
		{
			this.lastValue = value
			this.beginSearch(value)
		}
	},
	
	updateValue: function (value)
	{
		this.lastValue = value
		this.view.renderVariant(value)
		// this.parent.dispatchEvent({type:'modelChanged', value:value})
	},
	
	goEscape: function ()
	{
		this.updateValue(this.value)
		this.resetSelector()
	},
	
	goEnter: function (value)
	{
		this.updateValue(this.vals[this.selected] || this.value)
		this.resetSelector()
	},
	
	goBlur: function ()
	{
		this.resetSelector()
	},
	
	goUp: function (value)
	{
		if (!this.vals.length)
		 	return// this.beginSearch(value)
		
		switch (--this.selected)
		{
			case -1:
				value = this.value
			break
			
			case -2:
				this.selected = this.vals.length - 1
			
			default:
				value = this.vals[this.selected]
		}
		
		this.view.selectVariant(this.selected)
		this.updateValue(value)
	},
	
	goDown: function (value)
	{
		if (!this.vals.length)
			return this.beginSearch(value)
			
		
		switch (++this.selected)
		{
			case this.vals.length:
				this.selected = -1
				value = this.value
			break
			
			default:
				value = this.vals[this.selected]
		}
		
		this.view.selectVariant(this.selected)
		this.updateValue(value)
	},
	
	itemHovered: function (num)
	{
		if (this.selected != num)
		{
			this.selected = num
			this.value = this.vals[num]
			this.view.selectVariant(num)
		}
	},
	
	itemClicked: function (num)
	{
		this.selected = num
		this.value = this.vals[num]
		this.view.selectVariant(num)
		this.updateValue(this.value)
		this.resetSelector()
	}
})

Me.Model.prototype.extend
({
	count: 10,
	search: function (value)
	{
		var ds = this.dataSource
		return ds ? ds.search(value, this.count) : []
	}
})

})();
