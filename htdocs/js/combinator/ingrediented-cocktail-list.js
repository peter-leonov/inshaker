;(function(){

var myName = 'IngredientedCocktailList',
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
	
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		return this
	},
	
	setCocktails: function (cocktails)
	{
		this.view.renderCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Papa = IngredientedCocktailList, Me = Papa.View

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
	
	renderCocktails: function (cocktails)
	{
		var main = this.nodes.main
		main.empty()
		
		var list = N('ul')
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
			
			var item = Nct('li', 'item', cocktail.name)
			list.appendChild(item)
		}
		
		main.appendChild(list)
	}
	
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Papa = IngredientedCocktailList, Me = Papa.Controller

var myProto =
{
	initialize: function () {}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Papa = IngredientedCocktailList, Me = Papa.Model

var myProto =
{
	initialize: function ()
	{
		this.sources = {}
		this.state = {}
	}
}

Object.extend(Me.prototype, myProto)

})();
