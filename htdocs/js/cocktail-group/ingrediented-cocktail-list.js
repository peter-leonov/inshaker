;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View()
	
	m.view = v
	
	m.parent = v.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		return this
	},
	
	setCocktails: function (cocktails)
	{
		this.model.setCocktails(cocktails)
	}
}

Me.mixIn(EventDriven)

Me.className = 'IngredientedCocktailList'
self[Me.className] = Papa = Me

})();


;(function(){

eval(NodesShortcut.include())

var months = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']

function Me ()
{
	this.nodes = {}
	this.showRows = 0
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		nodes.more.addEventListener('click', function(){ me.renderRows() }, false)
	},

	renderGroups: function (groups)
	{
		var main = this.nodes.main
		main.empty()
		this.rows = []
		
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			
			var list = Nc('dl', 'group')
			main.appendChild(list)
			
			var head
			
			var name = group.name
			if (name)
				head = name
			else
			{
				var date = group.date
				if (date)
					head = months[date.getMonth()] + ' ' + date.getFullYear()
			}
			
			if (head)
			{
				var nameNode = list.appendChild(Nct('dt', 'group-name', head))
				nameNode.appendChild(Nct('span', 'count', '(' + group.rows.length + ')'))
				nameNode.addEventListener('click', this.onclickGroupName, false)
				nameNode['data-group-num'] = i
			}

			this.rows = this.rows.concat(group.rows)
		}
		
		this.renderRows = function()
		{
			var rows = this.rows
				i = this.showRows
			
			for (var j = i, jl = rows.length, cl = i+30; j < jl && j < cl; j++)
			{
				var row = rows[j]
				
				var item = Nc('li', 'row lines-' + ((((row.ingredients.length - 1) / 5) >> 0) + 1) + (j%2 ? ' even' : ' odd'))
				
				item.appendChild(this.renderCocktail(row.cocktail, row.ingredients))
				list.appendChild(item)
			}
			this.showRows = j
			this.renderButton()
		}
		
		this.renderRows()
	},
	
	renderButton: function()
	{
		var i = this.showRows,
			length = this.rows.length,
			more = this.nodes.more
			
		if ( i >= length )
			more.setClassName('hidden')
		else
			more.removeClassName('hidden')
	},
	
	renderCocktail: function (cocktail, ingredients)
	{
		var root = N('dl')
		
		var head = root.appendChild(Nc('dt', 'head'))
		var body = root.appendChild(Nc('dd', 'body'))
		
		head.appendChild(cocktail.getPreviewLink(false, true, false))
		body.appendChild(cocktail.getNameLink())
		
		var recipe = []
		for (var j = 0, jl = cocktail.ingredients.length; j < jl; j++) 
		{
			var ing = cocktail.ingredients[j]
			var ingObj = Ingredient.getByName(ing[0])
			
			var name = ing[0]
			
			var brand = ingObj.brand
			if (brand)
				name += ' ' + brand
			
			if (Ingredient.groups.indexOf(ingObj.group) < 10)
			{
				var dose = Units.humanizeDose(ing[1], ingObj.unit)
				name += ' ' + dose[0] + ' ' + dose[1]
			}
			
			recipe.push(name)
		}
		var recipeDiv = Nct('div', 'cocktail-recipe', recipe.join(', '))
		
		body.appendChild(recipeDiv)
			
		return root
	}
}

Papa.View = Me

})();

;(function(){

function Me () {}

Me.prototype =
{
	setCocktails: function (groups)
	{
		this.rawGroups = groups
		
		var res = []
		
		for (var i = 0, il = groups.length; i < il; i++)
		{
			var group = groups[i]
			
			var cocktails = group.cocktails
			
			var rows = []
			for (var j = 0, jl = cocktails.length; j < jl; j++)
			{
				var cocktail = cocktails[j]
			
				var row = rows[j] = {}
				row.cocktail = cocktail
			
				var ingredients = row.ingredients = []
			
				var recipe = cocktail.ingredients
				for (var k = 0, kl = recipe.length; k < kl; k++)
					ingredients[k] = Ingredient.getByName(recipe[k][0])
			}
			
			res[i] =
			{
				name: group.name,
				date: group.date,
				rows: rows
			}
		}
		
		this.groups = res
		this.view.renderGroups(res)
	}
}

Papa.Model = Me

})();


})();
