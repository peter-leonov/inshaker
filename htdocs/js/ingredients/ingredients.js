;(function(){

var myName = 'WidgetName',
	Me = self[myName] = MVC.create(myName)

// Me.mixIn(EventDriven)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},

	bind: function (nodes, sources, state)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		this.controller.bind(state)
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Papa = WidgetName, Me = Papa.View

// eval(NodesShortcut())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},

	bind: function (nodes)
	{
		this.nodes = nodes
		
		
		return this
	},
	
	modelChanged: function (data)
	{
		
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Papa = WidgetName, Me = Papa.Controller

var myProto =
{
	initialize: function ()
	{
		this.state = {}
	},
	
	bind: function (state)
	{
		this.state = state
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Papa = WidgetName, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
	}
}

Object.extend(Me.prototype, myProto)

})();