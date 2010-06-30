;(function(){

var Papa

;(function(){

var myName = 'Autocompleter',
	Me = Papa = self[myName] = MVC.create(myName)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
		this.model.controller = this.controller
	},
	
	bind: function (main, count)
	{
		this.view.bind({main:main})
		this.setCount(count === undefined ? 15 : count)
		return this
	},
	
	setDataSource: function (ds) { this.model.dataSource = ds },
	setValueGetter: function (f) { this.view.valueGetter = f },
	setValueSetter: function (f) { this.view.valueSetter = f },
	setCount: function (v) { this.model.setCount(v); this.view.setCount(v) },
	setInstant: function (v) { this.controller.instant = v },
	onconfirm: function () {}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	valueGetter: function (node) { return node.value },
	valueSetter: function (node, value) { node.value = value },
	
	initialize: function ()
	{
		this.nodes = {}
		this.keyMap = {38:'goUp', 40:'goDown', 37:false, 39:false, 9:false, 16:false, 17:false, 18:false, 91:false, 13:'goEnter', 27:'goEscape'}
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
	},
	
	onKeyPress: function (e)
	{
		var targ = e.target, controller = this.controller,
			action = this.keyMap[e.keyCode]
		// alert(e.keyCode)
		if (action === false)
			return
		else if (action)
		{
			if (controller[action](targ.value) === false)
			{
				e.preventDefault()
				e.stopPropagation()
			}
		}
		else
		{
			var me = this
			setTimeout(function () { me.onValue(targ) }, 1)
		}
	},
	
	onValue: function (node)
	{
		this.controller.goValue(this.valueGetter(node))
	},
	
	onBlur: function (e)
	{
		this.controller.goBlur()
	},
	
	onMouseMove: function (node, e)
	{
		this.controller.itemHovered(node.num)
	},
	
	onMouseDown: function (node, e)
	{
		this.controller.itemClicked(node.num)
	},
	
	setCount: function (count)
	{
		this.createItemsNodes(count)
	},
	
	renderVariant: function (str)
	{
		this.valueSetter(this.nodes.main, str)
	},
	
	show: function ()
	{
		var nodes = this.nodes
		nodes.main.addClassName('autocompleting')
		nodes.list.show()
		this.active = true
	},
	
	hide: function ()
	{
		var nodes = this.nodes
		nodes.main.removeClassName('autocompleting')
		nodes.list.hide()
		this.active = false
	},
	
	createItemsNodes: function (count)
	{
		var list = this.nodes.list, items = this.nodes.items = []
		list.empty()
		
		var me = this
		function mousedown (e) { me.onMouseDown(this, e) }
		function mousemove (e) { me.onMouseMove(this, e) }
		
		for (var i = 0; i < count; i++)
		{
			var item = items[i] = N('li')
			item.className = 'item'
			item.hide()
			list.appendChild(item)
			item.num = i
			item.addEventListener('mousedown', mousedown, false)
			item.addEventListener('mousemove', mousemove, false)
		}
	},
	
	renderResults: function (results)
	{
		var items = this.nodes.items
		for (var i = 0; i < results.length && i < items.length; i++)
		{
			var r = results[i],
				item = items[i]
			item.empty()
			item.appendChild(r[1]) // [1] means a text representing node (or DocumentFragment)
			item.show()
		}
		
		for (; i < items.length; i++)
			items[i].hide()
	},
	
	selectItem: function (num)
	{
		if (this.selected === num)
			return
		
		var node, items = this.nodes.items
		
		if ((node = items[this.selected]))
			node.removeClassName('selected')
		
		if ((node = items[num]))
			node.addClassName('selected')
		
		this.selected = num
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.reset()
		this.value = undefined
	},
	
	reset: function ()
	{
		this.results = []
		this.selected = -1
		this.value = ''
	},
	
	begin: function ()
	{
		if (this.active)
			return
		// log('begin')
		
		this.active = true
		this.view.show()
	},
	
	end: function ()
	{
		if (!this.active)
			return
		// log('end')
		
		this.active = false
		this.reset()
		this.view.hide()
	},
	
	search: function ()
	{
		this.model.search(this.value)
	},
	
	setResults: function (results)
	{
		this.selected = -1
		this.results = results
		this.view.renderResults(results)
		this.view.selectItem(-1)
	},
	
	selectBy: function (dir)
	{
		var total = this.results.length,
			selected = this.selected
		
		selected += dir
		
		if (selected < -1)
			selected = total - 1
		else if (selected >= total)
			selected = -1
		
		this.select(selected)
	},
	
	select: function (num)
	{
		if (this.selected === num)
			return
		
		this.selected = num
		this.view.selectItem(num)
	},
	
	sendSelected: function ()
	{
		this.view.renderVariant(this.selectedValue())
	},
	
	selectedValue: function ()
	{
		var selected = this.selected
		return selected < 0 ? this.value : this.results[selected][0] // [0] means a text value
	},
	
	dispatchConfirm: function ()
	{
		return this.parent.onconfirm({type:'confirm', data: {value:this.selectedValue(), selected:this.selected, results:this.results}})
	},
	
	goValue: function (value)
	{
		if (this.value !== value)
		{
			this.value = value
			if (value !== '')
			{
				this.begin()
				this.search()
			}
			else
				this.end()
		}
	},
	
	goUp: function (value)
	{
		if (this.active)
		{
			this.selectBy(-1)
			this.sendSelected()
			return false // drop an event
		}
	},
	
	goDown: function (value)
	{
		if (this.active)
		{
			this.selectBy(1)
			this.sendSelected()
		}
		else
		{
			this.value = value
			if (value !== '')
			{
				this.begin()
				this.search()
			}
		}
		
		return false // drop an event
	},
	
	goEnter: function (value)
	{
		if (this.active)
		{
			if (this.dispatchConfirm() !== false)
				this.sendSelected()
			
			this.end()
			
			return this.instant || false
		}
	},
	
	goEscape: function (value)
	{
		if (this.active)
		{
			this.view.renderVariant(this.value)
			this.end()
		}
	},
	
	goBlur: function ()
	{
		if (this.active)
		{
			this.sendSelected()
			this.end()
		}
	},
	
	itemHovered: function (num)
	{
		this.select(num)
	},
	
	itemClicked: function (num)
	{
		this.select(num)
		if (this.dispatchConfirm() !== false)
			this.sendSelected()
		this.end()
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Model

var myProto =
{
	setCount: function (v) { this.count = v },
	search: function (value)
	{
		var ds = this.dataSource
		this.controller.setResults(ds ? ds.search(value, this.count) : [])
	}
}

Object.extend(Me.prototype, myProto)

})();


})();
