;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes, count)
	{
		this.view.bind(nodes)
		this.setCount(count || 10)
		return this
	},
	
	reset: function () { this.controller.reset() },
	search: function (v) { this.controller.search(v) },
	setDataSource: function (ds) { this.model.dataSource = ds },
	setCount: function (v) { this.model.setCount(v) }
}

Me.mixIn(EventDriven)

Me.className = 'Autocompleter'
self[Me.className] = Papa = Me

})();



;(function(){

function Me ()
{
	this.nodes = {}
	this.listeners = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		this.listeners.keypress = function (e) { return me.onKeyPress(e) }
	},
	
	keyMap: {38: 'prev', 40: 'next', 27: 'reset', 13: 'accept'},
	onKeyPress: function (e)
	{
		// log(e.keyCode)
		var action = this.keyMap[e.keyCode]
		
		if (!action)
			return
		
		e.preventDefault()
		e.stopPropagation()
		
		var controller = this.controller
		window.setTimeout(function () { controller.action(action) }, 0)
	},
	
	focus: function ()
	{
		if (this.focused)
			return
		this.focused = true
		
		this.nodes.list.addClassName('focused')
		document.addEventListener('keypress', this.listeners.keypress, true)
	},
	
	blur: function ()
	{
		if (!this.focused)
			return
		this.focused = false
		
		this.nodes.list.removeClassName('focused')
		document.removeEventListener('keypress', this.listeners.keypress, true)
	},
	
	createItemsNodes: function (count)
	{
		var list = this.nodes.list, items = this.nodes.items = []
		
		var me = this
		function mousemove (e) { me.onMouseMove(this) }
		function mousedown (e) { me.onMouseDown(this) }
		
		for (var i = 0; i < count; i++)
		{
			var item = items[i] = N('li')
			item.className = 'item hidden'
			list.appendChild(item)
			item.setAttribute('data-autocompleter-num', i)
			item.addEventListener('mousemove', mousemove, false)
			item.addEventListener('mousedown', mousedown, false)
		}
	},
	
	onMouseMove: function (node)
	{
		this.controller.suggest(+node.getAttribute('data-autocompleter-num'))
	},
	
	onMouseDown: function (node)
	{
		this.controller.accept(+node.getAttribute('data-autocompleter-num'))
	},
	
	render: function (results)
	{
		if (!results)
		{
			this.blur()
			return
		}
		
		this.focus()
		this.renderItems(results)
	},
	
	renderItems: function (results)
	{
		var items = this.nodes.items
		for (var i = 0, il = items.length, rl = results.length; i < rl && i < il; i++)
		{
			var r = results[i],
				item = items[i]
			item.empty()
			item.appendChild(r[1]) // [1] means a text representing node (or DocumentFragment)
			item.removeClassName('hidden')
		}
		
		for (; i < items.length; i++)
			items[i].addClassName('hidden')
		
		this.nodes.list.toggleClassName('empty', rl == 0)
	},
	
	selectItem: function (num)
	{
		if (this.selected === num)
			return
		
		var items = this.nodes.items
		
		var node = items[this.selected]
		if (node)
			node.removeClassName('selected')
		
		var node = items[num]
		if (node)
			node.addClassName('selected')
		
		this.selected = num
	}
}

Me.className = Papa.className + '.View'
Papa.View = Me

})();


;(function(){

function Me () {}

Me.prototype =
{
	search: function (v)
	{
		this.model.search(v)
	},
	
	prev: function ()
	{
		this.model.selectBy(-1)
	},
	
	next: function ()
	{
		this.model.selectBy(1)
	},
	
	select: function (num)
	{
		this.model.select(num)
	},
	
	suggest: function (num)
	{
		this.model.suggest(num)
	},
	
	accept: function (num)
	{
		this.model.accept(num)
	},
	
	reset: function (num)
	{
		this.model.reset(num)
	},
	
	action: function (action)
	{
		this[action]()
	}
}

Papa.Controller = Me

})();


;(function(){

function Me ()
{
	this.results = null
	this.selected = -1
	this.value = null
}

Me.prototype =
{
	dataSource: {search: function () { return [] }},
	
	setCount: function (count)
	{
		this.count = count
		this.view.createItemsNodes(count)
	},
	
	reset: function ()
	{
		Me.call(this)
		this.view.render(null)
	},
	
	selectBy: function (dir)
	{
		var results = this.results
		if (!results)
			return
		
		var total = results.length,
			selected = this.selected
		
		selected += dir
		
		// -1 is a special case means “nothing selected”
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
		
		var results = this.results
		if (!results)
			return
		
		var v, res = results[num]
		if (res)
		{
			v = res[0]
		}
		else
		{
			v = new String(this.value)
			v.source = true
		}
			
		if (!this.parent.dispatchEvent({type: 'select', num: num, value: v}))
			return false
		
		this.selected = num
		this.view.selectItem(num)
	},
	
	suggest: function (num)
	{
		this.selected = num
		this.view.selectItem(num)
	},
	
	accept: function (num)
	{
		var results = this.results
		if (!results)
			return
		
		if (num === undefined)
			num = this.selected
		
		if (this.select(num) === false)
			return false
		
		var v, res = results[num]
		if (res)
		{
			v = res[0]
		}
		else
		{
			v = new String(this.value)
			v.source = true
		}
		
		if (!this.parent.dispatchEvent({type: 'accept', num: num, value: v}))
			return false
		
		this.reset()
	},
	
	search: function (value)
	{
		this.value = value
		var res = this.dataSource.search(value, this.count)
		this.setResults(res)
	},
	
	setResults: function (results)
	{
		this.selected = -1
		this.results = results
		this.view.render(results)
		this.view.selectItem(-1)
	}
}

Papa.Model = Me

})();


})();
