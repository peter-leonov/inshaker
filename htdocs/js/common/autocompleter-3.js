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
	
	bind: function (nodes, count)
	{
		this.view.bind(nodes)
		this.setCount(count || 10)
		return this
	},
	
	setDataSource: function (ds) { this.model.dataSource = ds },
	setCount: function (v) { this.model.setCount(v) }
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.keyMap = {38:'goUp', 40:'goDown', 37:false, 39:false, 9:false, 16:false, 17:false, 18:false, 91:false, 13:false, 27:false}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		var main = nodes.main
		
		var me = this
		main.addEventListener('keypress', function (e) { me.onKeyPress(e) }, false)
	},
	
	onKeyPress: function (e)
	{
		// alert(e.keyCode)
		var action = this.keyMap[e.keyCode]
		
		if (action === false)
			return
		
		if (action)
		{
			e.preventDefault()
			e.stopPropagation()
		}
		
		var me = this
		setTimeout(function () { me.onAction(action) }, 1)
	},
	
	onAction: function (action)
	{
		var v = this.nodes.main.value
		
		log(action, v)
		if (!action)
			this.controller.goValue(v)
	},
	
	onMouseMove: function (node, e)
	{
		this.controller.itemHovered(node.num)
	},
	
	onMouseDown: function (node, e)
	{
		this.controller.itemClicked(node.num)
	},
	
	renderVariant: function (str)
	{
		this.nodes.main.value = str
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
	goValue: function (v)
	{
		this.model.search(v)
	},
	
	goUp: function ()
	{
		this.model.selectBy(-1)
	},
	
	goDown: function ()
	{
		this.model.selectBy(1)
	},
	
	itemHovered: function (num)
	{
		this.model.select(num)
	},
	
	itemClicked: function (num)
	{
		this.model.accept(num)
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Model

var myProto =
{
	dataSource: {search: function () { return [] }},
	
	initialize: function ()
	{
		this.reset()
		this.value = undefined
	},
	
	setCount: function (count)
	{
		this.count = count
		this.view.createItemsNodes(count)
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
	
	accept: function (num)
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
	
	
	search: function (value)
	{
		var res = this.dataSource.search(value, this.count)
		this.setResults(res)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();
