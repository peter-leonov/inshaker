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
	bind: function (nodes)
	{
		this.view.bind(nodes)
	},
	
	setCocktails: function (group)
	{
		this.model.setCocktails(group)
	}
}

Me.className = 'IngredientedCocktailList'
self[Me.className] = Papa = Me

})();


;(function(){

eval(NodesShortcut.include())

function Me ()
{
	this.nodes = {}
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
	},

	renderGroup: function (group)
	{
		var main = this.nodes.main
		main.empty()
		
		var list = Nc('dl', 'group')
		main.appendChild(list)
		
		var nameNode = list.appendChild(Nct('dt', 'group-name', group.name))
		nameNode.appendChild(Nct('span', 'count', '(' + group.rows.length + ')'))

		this.nodes.list = list
	}
}

Papa.View = Me

})();

;(function(){

function Me () {}

Me.prototype =
{
}

Papa.Controller = Me

})();

;(function(){

function Me () {}

Me.prototype =
{
	setCocktails: function (group)
	{
		var cocktails = group.cocktails
		
		var rows = []
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = cocktails[i]
		
			var row = rows[i] = {}
			row.cocktail = cocktail
		
			var ingredients = row.ingredients = []
		
			var recipe = cocktail.ingredients
			for (var k = 0, kl = recipe.length; k < kl; k++)
				ingredients[k] = Ingredient.getByName(recipe[k][0])
		}
		
		var res =
		{
			name: group.name,
			rows: rows
		}
		
		this.group = res
		this.view.renderGroup(res)
	}
}

Papa.Model = Me

})();


})();
