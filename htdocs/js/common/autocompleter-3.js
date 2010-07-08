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

Me.mixIn(EventDriven)

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
		this.keyMap = {38:'prev', 40:'next', 37:false, 39:false, 9:false, 16:false, 17:false, 18:false, 91:false, 13:false, 27:false}
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
		var v = this.nodes.main.value,
			controller = this.controller
		
		if (action)
			controller[action]()
		else
			controller.search(v)
	},
	},
	
	createItemsNodes: function (count)
	{
		var list = this.nodes.list, items = this.nodes.items = []
		list.empty()
		
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
		this.controller.select(node.getAttribute('data-autocompleter-num'))
	},
	
	onMouseDown: function (node)
	{
		this.controller.accept(node.getAttribute('data-autocompleter-num'))
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
			item.removeClassName('hidden')
		}
		
		for (; i < items.length; i++)
			items[i].addClassName('hidden')
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

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Controller

var myProto =
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
	
	accept: function (num)
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
	
	selectBy: function (dir)
	{
		var total = this.results.length,
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
		
		var res = this.results[num]
		if (!res)
			return
		
		if (!this.parent.dispatchEvent({type: 'select', num: num, value: res[0]}))
			return
		
		this.selected = num
		this.view.selectItem(num)
	},
	
	accept: function (num)
	{
		var res = this.results[num]
		if (!res)
			return
		
		if (!this.parent.dispatchEvent({type: 'accept', num: num, value: res[0]}))
			return
		
		this.selected = num
	},
	
	search: function (value)
	{
		var res = this.dataSource.search(value, this.count)
		this.setResults(res)
	},
	
	setResults: function (results)
	{
		this.selected = -1
		this.results = results
		this.view.renderResults(results)
		this.view.selectItem(-1)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();
