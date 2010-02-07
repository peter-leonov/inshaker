;(function(){

var Papa = MatchingPage, Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
		this.cache = {ingredients: {}}
		this.selected = {}
		this.disabled = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.bindCocktailList()
		this.bindEvents()
		return this
	},
	
	bindCocktailList: function ()
	{
		var listNodes = this.nodes.cocktails
		
		var clNodes =
		{
			root: listNodes.root,
			viewport: listNodes.viewport,
			surface: listNodes.surface,
			prev: listNodes.prev,
			next: listNodes.next
		}
		
		var cl = this.cocktailList = new CocktailList()
		cl.bind(clNodes)
		cl.pageLength = 7
		cl.pageVelocity = 42
	},
	
	bindEvents: function ()
	{
		var nodes = this.nodes,
			me = this
		
		nodes.alphabetical.addEventListener('click', function (e) { me.ingredientClicked(e) }, false)
		nodes.forExample.addEventListener('click', function (e) { me.forExampleClicked(e) }, false)
	},
	
	forExampleClicked: function (e)
	{
		var ingredients = e.target.ingredients
		if (ingredients)
			this.controller.toggleIngredients(ingredients)
	},
	
	ingredientClicked: function (e)
	{
		var ingredient = e.target.ingredient
		if (ingredient)
			this.controller.toggleIngredients([ingredient])
	},
	
	modelChanged: function (data)
	{
		this.mergeIngredientClassNameStates(this.selected, data.selected, 'selected')
		this.selected = Object.copy(data.selected) // flat copying
		
		this.mergeIngredientClassNameStates(this.disabled, data.disabled, 'disabled')
		this.disabled = Object.copy(data.disabled) // flat copying
		
		this.nodes.main.toggleClassName('selecting-ingredients', !Object.isEmpty(this.selected))
		
		this.renderExample(data.randomIngredients)
		this.renderChosen(data.ingredients, data.cocktails)
		this.renderCocktails(data.cocktails)
	},
	
	renderChosen: function (ingredients, cocktails)
	{
		var nodes = this.nodes
		
		var inames = []
		for (var i = 0; i < ingredients.length; i++)
			inames.push(ingredients[i].name)
		
		var chosenIngeredients = nodes.chosenIngeredients
		chosenIngeredients.empty()
		chosenIngeredients.appendChild(T(inames.join(' + ')))
		
		var chosenCocktails = nodes.chosenCocktails, count = cocktails.length
		chosenCocktails.empty()
		var viewAll = N('a')
		viewAll.appendChild(T(count + ' ' + count.plural('коктейль', 'коктейля', 'коктейлей')))
		viewAll.href = '/cocktails.html#state=byIngredients&ingredients=' + encodeURIComponent(inames.join(','))
		chosenCocktails.appendChild(viewAll)
		
		log(ingredients, cocktails)
	},
	
	renderExample: function (ingredients)
	{
		if (!ingredients)
			return
		
		var text = []
		for (var i = 0; i < ingredients.length; i++)
			text[i] = ingredients[i].name
		
		var example = this.nodes.forExample
		example.firstChild.nodeValue = text.join(' + ')
		example.ingredients = ingredients
	},
	
	renderCocktails: function (cocktails)
	{
		if (!cocktails)
			return
		
		// cocktails = cocktails.slice().randomize()
		
		this.cocktailList.setCocktails(cocktails)
	},
	
	mergeIngredientClassNameStates: function (a, b, cn)
	{
		var cache = this.cache.ingredients
		
		// just an experiment with diff to reduce className usage
		// please see http://kung-fu-tzu.ru/posts/2009/04/03/fabulously-slow-classname/
		var diff = this.diffObjects(a, b)
		
		for (var k in diff.add)
			cache[k].addClassName(cn)
		
		for (var k in diff.remove)
			cache[k].removeClassName(cn)
	},
	
	renderIngredientsField: function (ingredients)
	{
		var root = this.nodes.alphabetical
		
		// as far as ingredients are alphabeticaly sorted
		var byLetter = this.splitIngredientsByLetter(ingredients),
			letters = Object.keys(byLetter)
		
		var heights = [], boxes = []
		for (var i = 0; i < letters.length; i++)
		{
			var letter = letters[i],
				ingredients = byLetter[letter]
			
			var box = boxes[i] = this.createLetterBox(letter, ingredients)
			// fast but approximated heights in lines
			heights[i] = ingredients.length + 2 // for letter name
			
			// // slow but precise heights in pixels
			// root.appendChild(box)
			// heights[i] = box.offsetHeight
			// log(box.offsetHeight)
		}
		// console.time('float')
		var optimum = this.floatColumns(heights, 5)
		// var optimum = this.floatColumns([1,10,1,1,1,3,1,1,1,1,1], 3)
		// console.timeEnd('float')
		
		root.empty()
		var cur = 0
		for (var i = 0; i < optimum.length; i++)
		{
			var col = Nc('div', 'col')
			for (var j = 0, jl = optimum[i]; j < jl; j++)
				col.appendChild(boxes[cur++])
			root.appendChild(col)
		}
		
	},
	
	floatColumns: function (heights, width)
	{
		var len = heights.length, iterations = 0,
			path = [], min = Infinity, minPath = []
		
		if (width === 0 || len === 0)
			return []
		
		if (width === 1 || len === 1)
			return [len]
		
		
		// precalculate approximated minumum
		// this block can be simply commented out
		{
			var med = (len / width) << 0,
				rem = len % width
			// log(med * width + rem, len)
			
			for (var i = 0; i < width; i++)
				minPath[i] = med
			
			for (var i = 0; i < rem; i++)
				minPath[i]++
			
			var cur = 0, min = 0
			for (var i = 0; i < width; i++)
			{
				var s = 0
				
				for (var j = 0, jl = minPath[i]; j < jl; j++)
					s += heights[cur++]
				
				if (s > min)
					min = s
			}
			
			// log(0, minPath, min)
		}
		
		miterations = width * 500
		
		// at start: my > 1, w > 1, m = 0
		function walk (my, w, m)
		{
			if (++iterations > miterations)
				throw 'too slow'
			
			if (w === 1)
			{
				path[width - w] = my
				
				var s = 0
				for (var i = 0; i < my; i++)
					s += heights[len - my + i]
				
				m = s > m ? s : m
				if (m < min)
				{
					min = m
					minPath = path
					// log(iterations, path, m)
				}
				// log(path, m)
				return
			}
			
			var s = heights[len - my]
			for (var i = 1; i < my; i++)
			{
				if (s > min)
					continue
				path[width - w] = i
				walk(my - i, w - 1, s > m ? s : m)
				s += heights[len - my + i]
			}
		}
		
		walk(len, width, 0)
		// log(iterations, minPath)
		
		return minPath
	},
	
	splitIngredientsByLetter: function (ingredients)
	{
		// as far as ingredients are alphabeticaly sorted
		var split = {}, letter, array
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				name = ingredient.name
			
			var ch = name.charAt(0)
			if (ch !== letter)
			{
				array = split[ch] = []
				letter = ch
			}
			
			array.push(ingredient)
		}
		
		return split
	},
	
	createLetterBox: function (letter, ingredients)
	{
		var box = Nc('dl', 'letter-box')
		
		box.appendChild(Nct('dt', 'letter', letter))
		
		var body = N('dd')
		box.appendChild(body)
		
		var list = Nc('ul', 'list')
		body.appendChild(list)
		
		var cache = this.cache.ingredients
		for (var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i],
				iname = ingredient.name
			
			var item = Nc('li', 'item')
			cache[iname] = item
			list.appendChild(item)
			
			var name = Nct('a', 'name', iname)
			name.ingredient = ingredient
			item.appendChild(name)
		}
		
		return box
	},
	
	diffObjects: function (a, b)
	{
		var add = {}, change = {}, remove = {}
		
		for (var k in b)
			if (k in a)
			{
				if (a[k] !== b[k])
					change[k] = b[k]
			}
			else
				add[k] = b[k]
		
		for (var k in a)
			if (!(k in b))
				remove[k] = a[k]
		
		return {add: add, change: change, remove: remove}
	}
}

Object.extend(Me.prototype, myProto)

})();