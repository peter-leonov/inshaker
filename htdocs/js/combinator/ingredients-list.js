;(function(){

var Papa

;(function(){

var myName = 'IngredientsList',
	Me = Papa = self[myName] = MVC.create(myName)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},
	
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		return this
	},
	
	setIngredients: function (ingredients)
	{
		this.model.setIngredients(ingredients)
	}
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
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	renderIngredients: function (groups)
	{
		log(groups)
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Controller

var myProto =
{
	initialize: function () {}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.groups = []
	},
	
	setState: function (groups)
	{
		this.groups = groups
		this.view.renderIngredients(groups)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();
