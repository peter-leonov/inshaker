;(function(){

var Papa

;(function(){

var myName = 'IngredientedCocktailList',
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
	
	setCocktails: function (cocktails, notInBar)
	{
		this.model.setCocktails(cocktails, notInBar)
	},
	
	wake: function ()
	{
		this.view.wake()
	},
	
	sleep: function ()
	{
		this.view.sleep()
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

function joinWithNodeToFragment (arr, node)
{
	var len = arr.length,
		res = document.createDocumentFragment()
	
	if (!len)
		return res
	
	for (var i = 0, il = len - 1; i < il; i++)
	{
		res.appendChild(arr[i])
		res.appendChild(node.cloneNode(true))
	}
	res.appendChild(arr[i])
	
	return res
}

var months = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.cache = {cocktails:{}}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		this.onclickGroupName = function () { me.groupNameClicked(this['data-group-num']) }
		
		var t = new Throttler(function () { me.onscroll() }, 100, 500)
		this.onscrollListener = function () { t.call() }
		
		this.wake()
	},
	
	wake: function ()
	{
		window.addEventListener('scroll', this.onscrollListener, false)
	},
	
	sleep: function ()
	{
		window.removeEventListener('scroll', this.onscrollListener, false)
	},
	
	onscroll: function ()
	{
		var frame = this.frame
		if (frame)
			frame.moveTo(window.pageXOffset, window.pageYOffset - 2500)
	},
	
	setupVisibilityFrame: function (nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.nodesToBoxes(nodes)
		
		var frame = this.frame = new VisibilityFrame()
		frame.setFrame(4000, 5000) // hardcoded for now
		frame.setStep(4000, 3000)
		frame.moveTo(0, -2500)
		
		var me = this
		frame.onmove = function (show, hide)
		{
			for (var i = 0; i < show.length; i++)
			{
				var box = show[i]
				if (!box.loaded)
				{
					var node = box.node,
						row = node['data-row']
					
					node.appendChild(me.renderCocktail(row.cocktail, row.ingredients))
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)
	},
	
	groupNameClicked: function (num)
	{
		this.controller.groupNameClicked(num)
	},
	
	renderGroups: function (groups, notInBar)
	{
		if(notInBar) this.notInBar = notInBar
		var main = this.nodes.main
		main.empty()
		
		var items = []
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
			
			if (group.collapsed)
			{
				list.addClassName('collapsed')
				continue
			}
			else
				list.removeClassName('collapsed')
			
			var rows = group.rows
			for (var j = 0, jl = rows.length; j < jl; j++)
			{
				var row = rows[j],
					ingredients = row.ingredients
				
				var item = Nc('li', 'row lazy lines-' + ((((ingredients.length - 1) / 5) >> 0) + 1))
				items.push(item)
				item['data-row'] = row
				list.appendChild(item)
			}
		}
		
		this.setupVisibilityFrame(items)
	},
	
	getCocktailNode: function (cocktail, ingredients)
	{
		var cache = this.cache.cocktails,
			name = cocktail.name
			
		var node = cache[name] || (cache[name] = this.renderCocktail(cocktail, ingredients))
		return node.cloneNode(true)
	},
	
	renderCocktail: function (cocktail, ingredients)
	{
		var root = N('dl')
		
		var head = root.appendChild(Nc('dt', 'head')),
			li = cocktail.getPreviewNode(false, true)
				
		head.appendChild(li)
		head.appendChild(Nct('span', 'operator', '='))
		
		var body = root.appendChild(Nc('dd', 'body'))
		
		var inodes = [], notInBar = this.notInBar || {}
		
		//ingredients.sort(function(a, b){ return !notInBar[a.name] && notInBar[b.name] ? 1 : -1 })
		
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				cn = ingredient.getPreviewNode()
			
			if(notInBar[ingredient.name])
			{
				(function(){
				cn.addClassName('not-in-bar')
				var add = Nct('span', 'add-ingredient', '+')
				add.addingIngredient = ingredient
				add.setAttribute('title', 'Добавить ингредиент')
				add.style.opacity = 0
				cn.appendChild(add)
				cn.addEventListener('mouseover', function(){ add.animate(false, { opacity : 1 }, 0.25) }, true)
				cn.addEventListener('mouseout', function(){ add.animate(false, { opacity : 0 }, 0.25) }, true)
				}())
			}
			//else
			//	cn.appendChild(Nc('div', 'tick'))
			
			inodes[i] = cn
		}
		body.appendChild(joinWithNodeToFragment(inodes, Nct('span', 'operator', '+')))
		
		return root
	}
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Controller

var myProto =
{
	initialize: function () {},
	
	groupNameClicked: function (num) { this.model.toggleGroupCollapsedility(num) }
}

Object.extend(Me.prototype, myProto)

})();


;(function(){

var Me = Papa.Model

var myProto =
{
	initialize: function () {},
	
	setCocktails: function (groups, notInBar)
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
		this.view.renderGroups(res, notInBar)
	},
	
	toggleGroupCollapsedility: function (num)
	{
		var groups = this.groups
		
		var group = groups[num]
		if (!group)
			return
		
		group.collapsed = !group.collapsed
		
		this.view.renderGroups(groups)
	}
}

Object.extend(Me.prototype, myProto)

})();


})();
