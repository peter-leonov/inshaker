;(function(){

var myName = 'Autocompleter'
var Me = self[myName] = MVC.create(myName)

Me.prototype.extend
({
	bind: function (main, count)
	{
		this.view.bind({main:main})
		this.setCount(count === undefined ? 10 : count)
		return this
	},
	
	setDataSource: function (ds) { this.model.dataSource = ds },
	setCount: function (v) { this.model.setCount(v); this.view.setCount(v) },
	setInstant: function (v) { this.controller.instant = v },
	onconfirm: function () {}
})

// Me.mixIn(EventDriven)

eval(NodesShortcut())

Me.View.prototype.extend
({
	initialize: function ()
	{
		this.nodes = {}
		this.keyMap = {38:'goUp', 40:'goDown', 13:'goEnter', 27:'goEscape'}
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
		// main.addEventListener('blur', function (e) { me.onBlur(e) }, false)
		main.addEventListener('keypress', function (e) { me.onKeyPress(e) }, false)
		list.addEventListener('mouseup', function (e) { me.onMouseDown(e) }, false)
		list.addEventListener('mousemove', function (e) { me.onMouseMove(e) }, false)
	},
	
	onKeyPress: function (e)
	{
		var targ = e.target, controller = this.controller,
			action = this.keyMap[e.keyCode]
		
		if (action)
		{
			if (controller[action](targ.value) === false)
			{
				e.preventDefault()
				e.stopPropagation()
			}
		}
		else
			setTimeout(function () { controller.goValue(targ.value) }, 1)
	},
	
	onBlur: function (e)
	{
		this.controller.goBlur()
	},
	
	onMouseMove: function (e)
	{
		this.controller.itemHovered(this.nodes.items.indexOf(e.target))
	},
	
	onMouseDown: function (e)
	{
		this.controller.itemClicked(this.nodes.items.indexOf(e.target))
	},
	
	setCount: function (count)
	{
		this.createItemsNodes(count)
	},
	
	renderVariant: function (str)
	{
		this.nodes.main.value = str
	},
	
	renderResults: function (results)
	{
		this.updateNodes(results)
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
		for (var i = 0; i < count; i++)
		{
			var item = items[i] = N('li')
			item.className = 'item'
			item.hide()
			list.appendChild(item)
		}
	},
	
	updateNodes: function (results)
	{
		var items = this.nodes.items
		for (var i = 0; i < results.length && i < items.length; i++)
		{
			var r = results[i],
				item = items[i]
			item.empty()
			item.appendChild(T(r))
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
})

Me.Controller.prototype.extend
({
	initialize: function ()
	{
		this.reset()
		this.value = undefined
	},
	
	reset: function ()
	{
		this.results = []
		this.selected = -1
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
		this.selectedValue = num < 0 ? this.value : this.results[num]
		this.view.selectItem(num)
	},
	
	sendSelected: function ()
	{
		this.view.renderVariant(this.selectedValue)
	},
	
	dispatchConfirm: function ()
	{
		this.parent.onconfirm({type:'confirm', data: {value:this.selectedValue, selected:this.selected, results:this.results}})
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
			this.sendSelected()
			this.dispatchConfirm()
			this.end()
			
			return this.instant || false
		}
	},
	
	goEscape: function (value)
	{
		this.view.renderVariant(this.value)
		this.end()
	},
	
	goBlur: function ()
	{
		this.view.renderVariant(this.value)
		this.end()
	},
	
	itemHovered: function (num)
	{
		this.select(num)
	},
	
	itemClicked: function (num)
	{
		this.select(num)
		this.sendSelected()
		this.dispatchConfirm()
		this.end()
	}
})

Me.Model.prototype.extend
({
	setCount: function (v) { this.count = v },
	search: function (value)
	{
		var ds = this.dataSource
		this.controller.setResults(ds ? ds.search(value, this.count) : [])
	}
})

})();
