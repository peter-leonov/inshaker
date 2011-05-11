;(function(){
var Papa = MyBar, Me = Papa.View
eval(NodesShortcut.include())
var myProto =
{
	getPreviewNodeOriginal : Ingredient.prototype.getPreviewNode,
	
	initialize : function()
	{
		this.nodes = {}
		
		var me = this
		
		Ingredient.prototype.getPreviewNode = function(addFlag, removeFlag)
		{
			var ingr = me.getPreviewNodeOriginal.call(this)
			
			if(!addFlag && !removeFlag) return ingr
			
			var li = Nc('li', 'ingredient')
			
			if(addFlag)
			{
				ingr.addClassName('not-in-bar')
				var ctrl = Nct('span', 'add-ingredient', '+')
				ctrl.addingIngredient = this
				ctrl.setAttribute('title', 'Добавить')
			}
			
			else if(removeFlag)
			{
				ingr.addClassName('in-bar')
				var ctrl = Nct('span', 'remove-ingredient', '×')
				ctrl.removingIngredient = this
				ctrl.setAttribute('title', 'Удалить ингредиент')				
			}
			
			ctrl.style.opacity = 0
			
			li.addEventListener('mouseover', function(){ ctrl.animate(false, { opacity : 1 }, 0.2) }, true)
			li.addEventListener('mouseout', function(){ ctrl.animate(false, { opacity : 0 }, 0.2) }, true)
			
			li.appendChild(ctrl)
			li.appendChild(ingr)
			
			return li
		}
		
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		this.incl = new IngredientedCocktailList()
		this.incl.bind({main: nodes.cocktails.wrapper})
		
		var me = this
		
		nodes.ingredients.tipIngredient.addEventListener('click', function(e){ me.controller.addIngredientToBar(this.ingredient) }, false)
		
		nodes.ingredients.searchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(nodes.ingredients.queryInput.value); }, false)
		nodes.ingredients.list.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleCocktailsSwitcherClick(e) }, false)
		nodes.ingredients.switcher.addEventListener('click', function(e){ me.handleIngredientsSwitcherClick(e) }, false)
		
		this.barName = new MyBarName()
		this.barName.bind(nodes.barName)		
		
		nodes.ingredients.resetButton.addEventListener('click', function(){ me.clearInput() }, false)
		
		var completer = this.completer = new PlainInputAutocompleter()
		completer.bind({ main : nodes.ingredients.queryInput, list : nodes.ingredients.complete })
		completer.addEventListener('accept', function (e) { me.controller.ingrQuerySubmit(e.value) }, false)
		
		nodes.menuLink.addEventListener('click', function(e){ if(!this.hasClassName('active')) e.preventDefault(); }, false)
		
		nodes.bottomOutput.wrapper.addEventListener('click', function(e){ me.handleBottomWrapperClick(e) }, false)
		
		nodes.output.addEventListener('click', function(e){ me.maybeIngredientClicked(e.target) }, false)
		nodes.bottomOutput.tagsCloud.addEventListener('click', function(e){ me.selectOtherTag(e) }, false)
		
		nodes.share.getLink.addEventListener('click', function(e){ this.setAttribute('disabled', 'disabled'); me.controller.getForeignLink() }, false)
		
		//suspended rendering
		var t = new Throttler(function(){ me.onscroll() }, 100, 500)
		window.addEventListener('scroll', function () { t.call() }, false)
	},
	
	onscroll : function()
	{
		
		if(this.nodes.bottomOutput.output.offsetPosition().top - window.screen.height > window.pageYOffset)
		{
			if(!this.recommendsWasRendered)
			{
				this.controller.updateRecommends()
			}	
			return
		}
		
		this.suspendedRecommendsFrame.checkout()
		this.suspendedMustHaveRecommendsFrame.checkout()
		//var frame = this.recommendsFrame
		//if(frame)
		//	frame.moveTo(window.pageXOffset, window.pageYOffset - 2500)
	},
	
	setCompleterDataSource : function (ds)
	{
		this.completer.setDataSource(ds)
	},
	
	renderBarName : function(barName)
	{
		this.barName.setMainState(barName)
	},
	
	renderShare : function(userid)
	{
		nodes = this.nodes.share
		if(!userid)
		{
			nodes.getLink.show()
			nodes.foreignBlock.hide()
		}
		else
		{
			var href = 'http://' + window.location.hostname + '/foreign.html#' + userid
			nodes.foreignLinkInput.value = href
			nodes.foreignLink.setAttribute('href', href)
			nodes.foreignBlock.show()
			nodes.getLink.hide()
		}
	},
	
	renderIngredients : function(ingredients, showByGroups, tipIngredient)
	{
		var ingr = this.nodes.ingredients
		
		ingr.tipIngredient.innerHTML = tipIngredient.name
		ingr.tipIngredient.ingredient = tipIngredient
		
		if(ingredients.length == 0)
		{
			ingr.list.empty()
			ingr.empty.show()
			ingr.switcher.hide()
			return
		}
		
		ingr.empty.hide()
		ingr.switcher.show()
		
		if(showByGroups)
		{
			ingr.swList.addClassName('link')
			ingr.swGroups.removeClassName('link')
			
			var dl = N('dl')
			for(var i = 0, l = ingredients.length, groupName = ''; i < l; i++)
			{
				var ingredient = ingredients[i]
				if(groupName != ingredient.group)
				{
					groupName = ingredient.group
					
					if(i != 0)
					{
						dl.appendChild(dt)
						dl.appendChild(dd)
					}
					
					var dt = Nct('dt', 'group-name', groupName)
					var dd = Nc('dd', 'group')
				}
				
				dd.appendChild(ingredients[i].getPreviewNode(false, true))
			}
			
			dl.appendChild(dt)
			dl.appendChild(dd)			
			
			ingr.list.empty()
			ingr.list.appendChild(dl)			
		}
		else
		{
			ingr.swGroups.addClassName('link')
			ingr.swList.removeClassName('link')
			
			var ul = N('ul')
			for(var i = 0, l = ingredients.length; i < l; i++)
			{
				ul.appendChild(ingredients[i].getPreviewNode(false, true))
			}
			
			ingr.list.empty()
			ingr.list.appendChild(ul)
		}
	},
	
	renderCocktails : function(cocktails, showCocktailsType)
	{
		var cl = cocktails.length
		var c = this.nodes.cocktails
		
		c.amount.innerHTML = cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')
		
		if(cocktails.length == 0)
		{
			this.renderIfCocktailsEmpty()
			return
		}
		
		c.block.show()
		
		this.nodes.menuLink.addClassName('active')
			
		c.switcher.show()
			
		switch(showCocktailsType)
		{
			case 'сочетания':
				c.swCombs.removeClassName('link')
				c.swPhotos.addClassName('link')
				
				var me = this
				setTimeout(function()
				{
					me.incl.setCocktails([{cocktails : cocktails}])
				}, 1)
				
				c.wrapper.show()
				break;
			
			case 'фото':
			default:
				c.swPhotos.removeClassName('link')
				c.swCombs.addClassName('link')
				
				var ul = Nc('ul', 'photos-list')
				for (var i = 0, il = cocktails.length; i < il; i++) 
				{
					var cNode = cocktails[i].getPreviewNode()
					ul.appendChild(cNode)
				}
				c.wrapper.empty()
				c.wrapper.appendChild(ul)
				
				c.wrapper.show()
				break;
		}
	},
	
/*
	renderBottomOutput : function(mustHave, boItems, showPackages, havingIngredients, havingCocktails)
	{
		//mustHave render		
		if(showPackages)
		{
			var i = 0
			for (var k in havingIngredients) 
			{
				if(havingIngredients[k]) i++
			}
			if(i == 0) boItems = []
			this.renderBoPackages(boItems, havingIngredients)
		}
		else
		{
			this.renderBoByCocktails(boItems)
		}
		
		this.mustHaveRender(mustHave)
	},
*/	
	setupRecommendsVisibilityFrame : function(nodes)
	{
		if (!nodes.length)
			return
		
		var boxes = Boxer.nodesToBoxes(nodes)
		
		var frame = this.recommendsFrame = new VisibilityFrame()
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
					var node = box.node
						
					if(node.mustHaveIngredient)
						node.appendChild(me.rendernOneMustHaveRecommend(node.mustHaveIngredient))
					
					else if(node.group)
						node.appendChild(me.renderOneRecommend(node.group))
						
					node.removeClassName('lazy')
					
					box.loaded = true
				}
			}
		}
		
		frame.setBoxes(boxes)		
	},

	renderBottomOutput : function(mustHaveRecommends, recommends)
	{	
		var recommendsNode = this.nodes.bottomOutput.recommends
		var dl = Nc('dl', 'show-by-cocktails')
		recommendsNode.empty()
		recommendsNode.appendChild(dl)
		
		var mustHaveNode = this.nodes.bottomOutput.mustHave
		var ul = N('ul')
		mustHaveNode.empty()
		mustHaveNode.appendChild(ul)
		
		this.suspendedRecommendsFrame = new SuspendRenderFrame(dl, recommends, this.renderOneRecommend)
		this.suspendedMustHaveRecommendsFrame = new SuspendRenderFrame(ul, mustHaveRecommends, this.renderOneMustHaveRecommend)
		
		//this.setupRecommendsVisibilityFrame(items)
		this.recommendsWasRendered = true
		this.onscroll()
	},
	
	renderOneMustHaveRecommend : function(mustHaveIngredient)
	{
			var li = Nc('li', 'row')
			
			li.recommendGroup = mustHaveIngredient
			li.mustHave = true
			
			var bigPlus = Nct('div', 'big-plus', '+')
			bigPlus.ingredients = [mustHaveIngredient.ingredient]
			
			var ing = mustHaveIngredient.ingredient.getPreviewNode(true)
			//ing.appendChild(mustHaveIngredient.ingredient.getPreviewNode(true))
			
			//var ing = Nc('div', 'ingredient')
			//ing.appendChild(mustHaveIngredient.ingredient.getPreviewNode())
			
			li.appendChild(bigPlus)
			li.appendChild(ing)
			
			var desc = Nc('p', 'description')
			desc.innerHTML = mustHaveIngredient.description
			li.appendChild(desc)
			
			return li
	},

	renderOneRecommend : function(group)
	{	
		var ingredients = group.ingredients,
			cocktails = group.cocktails,
			havingIngredients = group.havingIngredients,
			cl = cocktails.length
		
		var il = ingredients.length,
			cl = cocktails.length,
			tl = il + cl,
			perRow = 7
		
		/*-------------------------------*/
		if(tl <= perRow)
		{
			var rows = 1
			var iColumns = il
			var cColumns = cl
		}
		else
		{
			var len = il > cl ? il : cl
			var ti = [0]
			var tc = [0]
			var ri = rc = 0
			var li = lc = null
			for (var j = 0; j < len; j++) 
			{						
				if(ingredients[j])
				{
					if(ti[ri] + tc[rc] == perRow || li && ti[ri] == li)
					{
						var li = li || ti[ri]
						ri++
					}
					
					ti[ri] = ti[ri] || 0
					ti[ri]++
				}
					
				if(cocktails[j])
				{
					if(ti[ri] + tc[rc] == perRow || lc && tc[rc] == lc)
					{
						var lc = lc || tc[rc]
						rc++
					}
					
					tc[rc] = tc[rc] || 0
					tc[rc]++
				}
				
				var rows = ti.length > tc.length ? ti.length : tc.length
				if(rows - ti.length > 2 && ti[0] > 2)
				{
					ti = relocation(ti, ti[0] - 1)
					tc = relocation(tc, tc[0] + 1)
					ri = ti.length - 1
					rc = tc.length - 1
					li = ri[0]
					lc = rc[0]
				}
				else if(rows - tc.length > 2 && tc[0] > 2)
				{
					ti = relocation(ti, ti[0] + 1)
					tc = relocation(tc, tc[0] - 1)
					ri = ti.length - 1
					rc = tc.length - 1
					li = ri[0]
					lc = rc[0]
				}
			}
				
			var iColumns = ti[0]
			var cColumns = tc[0]	
			rows = ti.length > tc.length ? ti.length : tc.length
		}
		
		var df = document.createDocumentFragment()
		
		var dd = N('dd')
		dd.style.height = rows * 155 + 'px'
		
		dd.setAttribute('rows', rows)
		
		dd.recommendGroup = group
		
		var bigPlus = Nct('div', 'big-plus', '+')
		
		var head = Nc('ul', 'head')
		head.style.width = iColumns * 117 + 'px'
		
		var	eq = Nct('div', 'eq', '=')
		
		var body = Nc('ul', 'body')
		body.style.width = cColumns * 117 + 'px'
		/*-------------------------------*/
		
		bigPlus.ingredients = ingredients
		
		dd.appendChild(bigPlus)
		
		for (var i = 0; i < il; i++)
		{
			var ing = ingredients[i].getPreviewNode(true)
			//ing.appendChild(ingredients[i].getPreviewNode(true))
			head.appendChild(ing)
		}
		
		dd.appendChild(head)
		dd.appendChild(eq)
		

		
		for (var i = 0; i < cl; i++)
		{
			var n = cocktails[i].getPreviewNode()
			body.appendChild(n)
		}
		dd.appendChild(body)			
		
		var dt = Nc('dt', 'advice')
		
		var hs = createTextFromArr(havingIngredients)
		var is = createTextFromArr(ingredients, true)
		var cs = createTextFromArr(cocktails, true)
		
		var text = 'В твоем баре уже есть ' + hs + '. ' + 'Если будет ' + is + ', сможешь приготовить ' + cl.plural('коктейль','коктейли','коктейли') + ' ' + cs + '.'
		
		dt.appendChild(document.createTextNode(text))
		df.appendChild(dt)
		df.appendChild(dd)
		
		return df
		
		function createTextFromArr(arr, names)
		{
			if(names)
				arr = arr.map(function(a){ return a.name })
			var last = arr.pop()
			var s = arr.join(', ')
			return s ? s + ' и ' + last : last
		}
		
		function relocation(tarr, cols)
		{
			var sum = 0						
			for (var k = 0; k < tarr.length; k++) 
			{
				if(tarr[k])
					sum += tarr[k]
			}
			
			rows = 0
			var arr = []
			
			while(sum)
			{
				for (var k = 0; k < cols; k++) 
				{
					sum--
					arr[rows] = ++arr[rows] || 1
					
					if(!sum)
						break;
				}
				rows++
			}
			
			return arr
		}
	},
	
	bottomRecommendsRender : function(groups)
	{	
		var dl = Nc('dl', 'show-by-cocktails')
		var items = []
		
		for (var i = 0, l = groups.length; i < l; i++) 
		{
			var g = groups[i]
			var ingredients = g.ingredients
			var cocktails = g.cocktails
			var il = ingredients.length
			var cl = cocktails.length
			var tl = il + cl
			var perRow = 7
			if(tl <= perRow)
			{
				var rows = 1
				var iColumns = il
				var cColumns = cl
			}
			else
			{
				var len = il > cl ? il : cl
				var ti = [0]
				var tc = [0]
				var ri = rc = 0
				var li = lc = null
				for (var j = 0; j < len; j++) 
				{						
					if(ingredients[j])
					{
						if(ti[ri] + tc[rc] == perRow || li && ti[ri] == li)
						{
							var li = li || ti[ri]
							ri++
						}
						
						ti[ri] = ti[ri] || 0
						ti[ri]++
					}
					
					if(cocktails[j])
					{
						if(ti[ri] + tc[rc] == perRow || lc && tc[rc] == lc)
						{
							var lc = lc || tc[rc]
							rc++
						}
						
						tc[rc] = tc[rc] || 0
						tc[rc]++
					}
					
					var rows = ti.length > tc.length ? ti.length : tc.length
					if(rows - ti.length > 1 && ti[0] > 1)
					{
						ti = relocation(ti, ti[0] - 1)
						tc = relocation(tc, tc[0] + 1)
					}
					else if(rows - tc.length > 1 && tc[0] > 1)
					{
						ti = relocation(ti, ti[0] + 1)
						tc = relocation(tc, tc[0] - 1)
					}
				}
				
				var iColumns = ti[0]
				var cColumns = tc[0]
			}
			
			var dd = Nc('dd', 'lazy')
			
			dd.style.height = rows * 155 + 'px'
			g.iColumns = iColumns
			g.cColumns = cColumns
			items.push(dd)
			dd.group = g
			
			dl.appendChild(dd)
		}
		
		var main = this.nodes.bottomOutput.recommends
		main.empty()
		main.appendChild(dl)
		
		return items
		
		function relocation(tarr, cols)
			{
				var sum = 0						
				for (var k = 0; k < tarr.length; k++) 
				{
					sum += tarr[k]
				}
				
				rows = 0
				var arr = []
				while(sum)
				{
					for (var k = 0; k < cols; i++) 
					{
						sum--
						arr[rows] = ++arr[rows] || 1
						
						if(!sum)
							break;
					}
					rows++
				}
				
				return arr
			}
	},
	
	mustHaveRender : function(mustHave)
	{
		var mustHaveUl = N('ul')
		var items = []
		for (var i = 0, il = mustHave.length; i < il; i++) 
		{
			var li = Nc('li', 'row lazy')	
			li.mustHaveIngredient = mustHave[i]
			items.push(li)
			mustHaveUl.appendChild(li)
		}
		
		var main = this.nodes.bottomOutput.mustHave
		main.empty()
		main.appendChild(mustHaveUl)
		
		return items
	},
	
	renderTagsSelect : function(tags, currentTag, tagsAmount)
	{
		
		var node = this.nodes.bottomOutput.tagsCloud
			//node = this.nodes.bottomOutput.selectTag,
			//tagForm = this.nodes.bottomOutput.tagForm
			
			
		
		
		if(!tags.length)
		{
			node.hide()
			return
		}
			
		var df = document.createDocumentFragment()
		
		for (var i = 0, il = tags.length; i < il; i++) 
		{
			var tag = tags[i]
			var div = Nc('div', 'wrap-tag')
			var span = Nct('span', 'tag', tag + ' (' + tagsAmount[tag] + ')')
			//option.innerHTML = tag + ' (' + tagsAmount[tag] + ')'
			//option.value = tag
			span.tagValue = tag
			if(tag.localeCompare(currentTag) == 0)
				div.addClassName('current')
				//option.setAttribute('selected', 'selected')
			
			div.appendChild(span)
			df.appendChild(div)
		}
		
		//node.innerHTML = ''
		//node.appendChild(fragment)
		//tagForm.show()
		node.empty()
		node.appendChild(df)
		node.show()
	},
	
	/*
	renderBoPackages : function(cocktails, havingIngredients)
	{
		var main = this.nodes.bottomOutput.recommends
		
		var ul = Nc('ul', 'packages')
		
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cocktail = cocktails[i],
				li = Nc('li', 'package'),
				ingDiv = Nc('ul', 'ingredients list'),
				cocktailDiv = Nc('div', 'cocktail')
				
			cocktailDiv.appendChild(cocktail.getPreviewNode())
			
			for (var j = 0, jl = cocktail.ingredients.length; j < jl; j++) 
			{
				var ingName = cocktail.ingredients[j][0]
				if(!havingIngredients[ingName])
				{					
					var item = Nc('li', 'ingredient')
					item.appendChild(Ingredient.getByName(ingName).getPreviewNode())
					ingDiv.appendChild(item)
				}
			}
			
			var bigPlus = Nct('div', 'big-plus', '+')
			bigPlus.ingredients = cocktail.ingredients.map(function(a){ return Ingredient.getByName(a[0]) })
			
			li.appendChild(bigPlus)
			li.appendChild(ingDiv)
			li.appendChild(Nct('div', 'eq', '='))
			li.appendChild(cocktailDiv)
			
			ul.appendChild(li)
		}
		
		main.empty()
		main.appendChild(ul)
	},
	
	renderBoByCocktails : function(groups)
	{
		var main = this.nodes.bottomOutput.recommends
	
		var dl = Nc('dl', 'show-by-cocktails')
		
		for (var i = 0, il = groups.length; i < il; i++) 
		{
			(function(){
			var ingredient = groups[i].ingredient,
				cocktails = groups[i].cocktails,
				cl = cocktails.length
			
			var dt = Nc('dt', 'title-label') 
				dd = N('dd'),	
				ing = Nc('li', 'ingredient'),
				eq = Nct('li', 'eq', '='),
				head = Nc('ul', 'head'),
				bigPlus = Nct('li', 'big-plus', '+')
			
			bigPlus.ingredients = [ingredient]
			ing.appendChild(ingredient.getPreviewNode())
			
			head.appendChild(bigPlus)
			head.appendChild(ing)
			head.appendChild(eq)
			
			dd.appendChild(head)
			
			var body = Nc('ul', 'body')
			
			for (var j = 0; j < cl; j++)
				body.appendChild(cocktails[j].getPreviewNode())
			
			dd.appendChild(body)			
			dl.appendChild(dd)
			
			})()
		}
		
		main.empty()
		main.appendChild(dl)	
	},
	*/
	renderIfCocktailsEmpty : function()
	{
		var c = this.nodes.cocktails
		c.block.hide()
	},
	
	clearInput : function()
	{
		this.nodes.ingredients.queryInput.value = ''
	},
	
	handleIngredientClick : function(e)
	{
		var node = e.target

		if(node.removingIngredient)
		{
			this.controller.removeIngredientFromBar(node.removingIngredient)
		}	
	},

	handleCocktailsSwitcherClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('link'))
		{
			this.controller.switchCocktailsView(node.innerHTML)
		}
	},
	
	handleIngredientsSwitcherClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('link'))
		{
			if(node.hasClassName('by-groups'))
			{
				this.controller.switchIngredientsView(true)
			}
			else
			{
				this.controller.switchIngredientsView(false)
			}
		}		
	},
	
	handleBoTitleClick : function(e)
	{
		var target = e.target
		if(target.hasClassName('link'))
		{
			if(target.hasClassName('easy-to-make'))
				this.controller.switchBoShowType(false)
			else
				this.controller.switchBoShowType(true)
		}
	},
	
	handleBottomWrapperClick : function(e)
	{
		var target = e.target
		
		if(!target.ingredients && !target.addingIngredient)
		{
			return
		}
		
		this.recommendsWasRendered = false
		this.oldDocHeight = document.documentElement.scrollHeight
		
		this.currentRecommend = this.findParentRecommend(target.recommendNode)
		
		var group = this.currentRecommen.recommendGroup
		
		if(target.ingredients)
		{
			this.controller.addIngredientsFromBo(target.ingredients, group)
		}
		else if(target.addingIngredient)
		{
			this.controller.addIngredientsFromBo([target.addingIngredient], group)
		}
	},
	
	findParentRecommend : function(node)
	{
		while(node.parentNode)
		{
			var parent = node.parentNode
			if(parent.recommendGroup)
			{
				return parent
			}
		}
		
		return false
	}
	
	maybeIngredientClicked : function(target)
	{
		if(!target.parentNode)
			return
		
		var ingredient = target.parentNode['data-ingredient']
		if(ingredient)
		{
			this.controller.ingredientSelected(ingredient)
		}
	},
	
	showIngredient: function (ingredient)
	{
		if (ingredient)
		{
			var popup = IngredientPopup.show(ingredient)
			var controller = this.controller
			popup.onhide = function () { controller.ingredientSelected(null) }
		}
		else
			IngredientPopup.hide()
	},
	
	selectOtherTag : function(e)
	{
		var target = e.target
		if(target.tagValue && !target.parentNode.hasClassName('current'))
		{
			this.controller.showTagRecommends(target.tagValue)
		}
	},
	
	setScrollTop : function()
	{
		var delta = document.documentElement.scrollHeight - this.oldDocHeight
		document.documentElement.scrollTop += delta
		document.body.scrollTop += delta
	}
}
Object.extend(Me.prototype, myProto)
})();