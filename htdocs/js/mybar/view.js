;(function(){
var Papa = MyBar, Me = Papa.View
eval(NodesShortcut.include())
var myProto =
{	
	initialize : function()
	{
		this.nodes = {}
		
		this.currentRecommends = []
		this.currentMustHaveRecommends = []
		
		this.havingIngredientsNames = {}
		this.havingCocktailsNames = {}
		
		var me = this
		
		Ingredient.prototype.getPreviewNodeExt = function(have)
		{
			var node = Ingredient.prototype.getPreviewNode.call(this)	
			var li = Nc('li', 'ingredient'),
				control = Nc('div', 'control')
			
			control.ingredient = this
			
			li.appendChild(node)
			li.appendChild(control)
				
			if(have)
			{
				li.addClassName('have')
			}
			
			else
			{
				li.addClassName('no-have')				
			}
			
			return li
		}
		
		Cocktail.prototype.getPreviewNodeExt = function(have)
		{
			var li = Cocktail.prototype.getPreviewNode.call(this)
			var control = Nc('div', 'control'),
				tick = Nc('div', 'tick')
				
			control.cocktail = this
			
			li.appendChild(control)
			li.appendChild(tick)
				
			if(have)
			{
				li.addClassName('have')
			}
			else
			{
				li.addClassName('no-have')				
			}
			
			return li
		}
	},
	
	bind : function (nodes)
	{
		this.nodes = nodes
		this.incl = new IngredientedCocktailList()
		this.incl.bind({main: nodes.cocktails.visible})
		
		var me = this
		
		//nodes.ingredients.tipIngredient.addEventListener('click', function(e){ me.controller.addIngredientToBar(this.ingredient) }, false)
		
		var completer = this.completer = new PlainInputAutocompleter()
		completer.bind({ main : nodes.ingredients.queryInput, list : nodes.ingredients.complete })
		completer.addEventListener('accept', function (e) { me.controller.ingrQuerySubmit(e.value) }, false)
		
		nodes.mainBox.addEventListener('click', function(e){ me.maybeIngredientClicked(e.target) }, false)
		
		nodes.ingredients.title.barName.addEventListener('focus', function(e){ me.handleBarNameFocus(e) }, false)
		nodes.ingredients.title.barName.addEventListener('keypress', function(e){ me.handleBarNameKeypress(e) }, false)
		nodes.ingredients.title.barName.addEventListener('blur', function(e){ me.handleBarNameBlur(e) }, false)
		
		nodes.ingredients.searchForm.addEventListener('submit', function (e) { e.preventDefault(); me.controller.ingrQuerySubmit(nodes.ingredients.queryInput.value); }, false)
		nodes.ingredients.list.addEventListener('click', function(e){ me.handleIngredientClick(e) }, false)
		nodes.ingredients.switcher.addEventListener('click', function(e){ me.handleIngredientsSwitcherClick(e) }, false)
		
		nodes.cocktails.visible.addEventListener('click', function(e){ me.handleVisibleCocktailClick(e) }, false)
		nodes.cocktails.hiddenList.addEventListener('click', function(e){ me.handleHiddenCocktailClick(e) }, false)
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleCocktailsSwitcherClick(e) }, false)
		
		nodes.recommends.tagsList.addEventListener('click', function(e){ me.handleTagsClick(e) }, false)
		nodes.recommends.wrapper.addEventListener('click', function(e){ me.addIngredientFromRecommends(e) }, false)
		//this.barName = new MyBarName()
		//this.barName.bind(nodes.barName)		
		
		//nodes.ingredients.resetButton.addEventListener('click', function(){ me.clearInput() }, false)		
		//nodes.menuLink.addEventListener('click', function(e){ if(!this.hasClassName('active')) e.preventDefault(); }, false)
		
		//nodes.recommends.box.addEventListener('click', function(e){ me.handleRecommendsBoxClick(e) }, false)
		
		//nodes.recommends.tagsList.tagsCloud.addEventListener('click', function(e){ me.selectOtherTag(e) }, false)
		
		//nodes.share.getLink.addEventListener('click', function(e){ this.setAttribute('disabled', 'disabled'); me.controller.getForeignLink() }, false)
		
		//nodes.upgradeRecommends.addEventListener('click', function(){ if(!me.recommendsWasRendered) me.controller.upgradeRecommends() }, false)
		
		//suspended rendering
		var t = new Throttler(function(){ me.onscroll() }, 100, 500)
		window.addEventListener('scroll', function () { t.call() }, false)
	},
	
	handleBarNameFocus : function(e)
	{
		this.nodes.ingredients.title.advice.hide()
	},
	
	handleBarNameKeypress : function(e)
	{
		if(e.keyCode == 13)
		{
			e.preventDefault()
			e.target.blur()
		}
	},
	
	handleBarNameBlur : function(e)
	{
		var value = ''
		if(e.target.firstChild)
		{
			value = e.target.firstChild.nodeValue
		}
		this.controller.changeBarName(value)
	},
	
	onscroll : function()
	{
		if(this.nodes.recommends.box.offsetPosition().top - window.screen.height > window.pageYOffset || window.pageYOffset == 0)
		{
			this.controller.upgradeRecommends()
			return
		}
		
		this.controller.checkoutRecommends()
		this.controller.checkoutMustHaveRecommends()
	},
	
	checkoutRecommends : function(listLength)
	{
		var node = this.nodes.recommends.recommendsList,
			supply = 400,
			i = 4
			
		while(listLength > 0 && this.getSupply(node) < supply)
		{
			while(i-- && listLength--)
			{
				this.controller.addRecommend()
			}
		}
	},
	
	checkoutMustHaveRecommends : function(listLength)
	{
		var node = this.nodes.recommends.mustHaveList,
			supply = 400,
			i = 4
		
		while(listLength > 0 && this.getSupply(node) < supply)
		{
			while(i-- && listLength--)
			{
				this.controller.addMustHaveRecommend()
			}
		}
	},
	
	getSupply : function(node)
	{
		return node.offsetHeight + node.offsetPosition().top - window.screen.height - window.pageYOffset
	},
	
	setCompleterDataSource : function (ds)
	{
		this.completer.setDataSource(ds)
	},
	
	renderBarName : function(barName)
	{
		var nodes = this.nodes.ingredients.title
		if(barName)
		{
			nodes.barName.empty()
			nodes.barName.appendChild(T(barName))
			nodes.advice.hide()
		}
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
	
	renderIngredients : function(ingredients, showType)
	{
		var nodes = this.nodes.ingredients,
			il = ingredients.length
		
		if(il == 0)
		{
			nodes.list.hide()
			nodes.switcher.hide()
			nodes.links.hide()
			nodes.empty.show()
			this.hideCocktailsBox()
			return
		}
		
		nodes.empty.hide()
		nodes.links.show()
		nodes.switcher.className = 'switcher ' + showType
		nodes.list.empty()
		nodes.list.show()
		this.showCocktailsBox()
		
		switch(showType)
		{
			case 'by-groups':
			{
				var dl = Nc('dl', 'by-groups')
				for(var i = 0, groupName = ''; i < il; i++)
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
						
						var dt = Nc('dt', 'group-name')
						var div = Nct('div', 'name-wrapper', groupName)
						var dd = Nc('dd', 'group')
						var ul = N('ul')
						
						div.appendChild(N('i'))
						dd.appendChild(ul)
						dt.appendChild(div)
					}
					
					ul.appendChild(ingredients[i].getPreviewNodeExt(true))
				}
				
				dl.appendChild(dt)
				dl.appendChild(dd)			
				
				nodes.list.appendChild(dl)
				break;
			}
			
			case 'by-list':
			default:
			{
				var ul = Nc('ul', 'by-list')
				for(var i = 0 ; i < il; i++)
				{
					ul.appendChild(ingredients[i].getPreviewNodeExt(true))
				}
				
				nodes.list.appendChild(ul)			
			}
		}
	},
	
	renderCocktails : function(visibleCocktails, hiddenCocktails, showType)
	{
		var nodes = this.nodes.cocktails,
			vcl = visibleCocktails.length,
			hcl = hiddenCocktails.length,
			cl = vcl + hcl
		
		if(vcl == 0)
		{
			this.nodes.share.box.addClassName('zero-cocktails')
		}
		else
		{
			this.nodes.share.box.removeClassName('zero-cocktails')
		}
			
		if(cl == 0)
		{
			nodes.wrapper.hide()
			nodes.switcher.hide()
			nodes.title.h2.className = 'zero-cocktails'
			nodes.links.hide()
			nodes.empty.show()	
			return
		}
		
		nodes.title.plural.firstChild.nodeValue = cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')
		nodes.title.h2.className = ''
		nodes.links.show()
		nodes.empty.hide()
		nodes.switcher.className = 'switcher ' + showType
		
		switch(showType)
		{
			case 'by-ingredients':
			{	
				var me = this
				setTimeout(function()
				{
					me.incl.setCocktails([{cocktails : visibleCocktails}])
				}, 1)
				break;
			}
			case 'by-pics':
			default:
			{				
				var ul = Nc('ul', 'by-pics')
				for (var i = 0; i < vcl; i++) 
				{
					var cNode = visibleCocktails[i].getPreviewNodeExt(true)
					ul.appendChild(cNode)
				}
				nodes.visible.empty()
				nodes.visible.appendChild(ul)
				break;
			}
		}
		
		if(hcl == 0)
		{
			nodes.hidden.hide()
		}
		else
		{
			var df = document.createDocumentFragment()
			for (var i = 0; i < hcl; i++) 
			{
				var cNode = hiddenCocktails[i].getPreviewNodeExt(true)
				df.appendChild(cNode)
			}
			
			nodes.hiddenList.empty()
			nodes.hiddenList.appendChild(df)
			nodes.hidden.show()
		}
		
		nodes.wrapper.show()
	},

	hideCocktailsBox : function()
	{
		this.nodes.cocktails.box.hide()
		this.nodes.share.box.hide()
	},
	
	showCocktailsBox : function()
	{
		this.nodes.cocktails.box.show()
		this.nodes.share.box.show()		
	},

	prepareRecommends : function(clearNodes)
	{	
		this.currentRecommends = []
		this.currentMustHaveRecommends = []
		
		this.nodes.recommends.recommendsList.empty()
		this.nodes.recommends.mustHaveList.empty()
		
		this.onscroll()
	},
	
	renderMustHaveRecommend : function(mustHaveIngredient, ingredientsHash)
	{
		var row = Nc('li', 'row')
		row.recommendWrapper = true
		
		var ingredient = mustHaveIngredient.ingredient
		
		var node = ingredient.getPreviewNodeExt(ingredientsHash[ingredient.name])
		
		row.appendChild(node)
		
		var desc = Nc('p', 'description')
		desc.innerHTML = mustHaveIngredient.description
		row.appendChild(desc)
		
		this.currentMustHaveRecommends.push({ node : node, ingredient : ingredient })
		this.nodes.recommends.mustHaveList.appendChild(row)
	},

	renderRecommend : function(group, cocktailsHash, ingredientsHash)
	{
		var df = document.createDocumentFragment()
		var dt = this.getRecommendDt(group, cocktailsHash, ingredientsHash)
		var dd = this.getRecommendDd(group, cocktailsHash, ingredientsHash)
		
		this.currentRecommends.push({ group : group, dt : dt, dd : dd })
		df.appendChild(dt)
		df.appendChild(dd)
		this.nodes.recommends.recommendsList.appendChild(df)
	},
	
	getRecommendDt : function(group, cocktailsHash, ingredientsHash)
	{
		var dt = Nc('dt', 'advice')
		var text = this.getTextForRecommend(group, cocktailsHash, ingredientsHash)
		dt.appendChild(text)
		return dt
	},
	
	getTextForRecommend : function(group, cocktailsHash, ingredientsHash)
	{
		var	ingredients = group.ingredients,
			cocktails = group.cocktails,
			havingIngredients = group.havingIngredients.slice()
		
		var noHavingIngredients = []
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			
			if(ingredientsHash[ingredient.name])
			{
				havingIngredients.push(ingredient)
			}
			else
			{
				noHavingIngredients.push(ingredient)
			}
		}
		
		var havingCocktails = [], noHavingCocktails = []
		for (var i = 0, cl = cocktails.length; i < cl; i++) 
		{
			var cocktail = cocktails[i]
			
			if(cocktailsHash[cocktail.name])
			{
				havingCocktails.push(cocktail)
			}
			else
			{
				noHavingCocktails.push(cocktail)
			}
		}
		
		var text = document.createDocumentFragment()
		
		log(havingIngredients)
		
		if(havingIngredients.length != 0)
		{
			text.appendChild(T('В твоем баре уже есть '))
			text.appendChild(this.createIngredientsTextFromArr(havingIngredients))
			text.appendChild(T('. '))
			text.appendChild(N('br'))
		}
		if(havingCocktails.length != 0)
		{
			text.appendChild(T('Теперь ты можешь приготовить ' +  havingCocktails.length.plural('коктейль','коктейли','коктейли') + ' '))
			text.appendChild(this.createCocktailsTextFromArr(havingCocktails))
			text.appendChild(T('. '))
			text.appendChild(N('br'))
		}
		if(noHavingCocktails.length != 0)
		{
			text.appendChild(T('Если будет '))
			text.appendChild(this.createIngredientsTextFromArr(noHavingIngredients))
			text.appendChild(T(', сможешь приготовить ' + noHavingCocktails.length.plural('коктейль','коктейли','коктейли') + ' '))
			text.appendChild(this.createCocktailsTextFromArr(noHavingCocktails))
			text.appendChild(T('. '))
		}
		
		return text
	},
	
	createCocktailsTextFromArr : function(cocktails)
	{
		var df = document.createDocumentFragment()
		for (var i = 0, il = cocktails.length; i < il; i++) 
		{
			var cocktail = cocktails[i]
			var link = Nct('a', 'cocktail-link', cocktail.name)
			link.href = cocktail.getPath()
			
			if(i == il - 1 && i != 0)
			{
				df.appendChild(T(' и '))
			}
			else if(i != 0)
			{
				df.appendChild(T(', '))
			}
			
			df.appendChild(link)				
		}
		
		return df
	},		
	
	createIngredientsTextFromArr : function(ingredients)
	{
		var df = document.createDocumentFragment()
		for (var i = 0, il = ingredients.length; i < il; i++) 
		{
			var ingredient = ingredients[i]
			var link = Nct('span', 'ingredient-link', ingredient.name)
			link['data-ingredient'] = ingredient
			
			if(i == il - 1 && i != 0)
			{
				df.appendChild(T(' и '))
			}
			else if(i != 0)
			{
				df.appendChild(T(', '))
			}
			
			df.appendChild(link)
		}
		
		return df		
	},
	
	getRecommendDd : function(group, cocktailsHash, ingredientsHash)
	{
		var ingredients = group.ingredients,
			cocktails = group.cocktails,
			cl = cocktails.length,
			il = ingredients.length
		
		var dd = Nc('dd', 'recommend')
		dd.recommendWrapper = true
		
		var tl = il + cl,
			perRow = 7
		
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
		
		dd.style.height = rows * 155 + 'px'
		
		dd.setAttribute('rows', rows)
		
		var head = Nc('ul', 'head')
		head.style.width = iColumns * 117 + 'px'
		
		var body = Nc('ul', 'body')
		body.style.width = cColumns * 117 + 'px'
		
		var	eq = Nct('div', 'eq', '=')
		
		dd.ingredientsList = []
		dd.cocktailsList = []
		
		for (var i = 0; i < il; i++) 
		{
			var ingredient = ingredients[i]
			var node = ingredient.getPreviewNodeExt(ingredientsHash[ingredient.name])
			head.appendChild(node)
			dd.ingredientsList[i] = { node : node, ingredient : ingredient }
		}
		
		for (var i = 0; i < cl; i++) 
		{
			var cocktail = cocktails[i]
			var node = cocktail.getPreviewNodeExt(cocktailsHash[cocktail.name])
			body.appendChild(node)
			dd.cocktailsList[i] = { node : node, cocktail : cocktail }
		}
		
		dd.appendChild(head)
		dd.appendChild(eq)
		dd.appendChild(body)
		
		return dd
		
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
	
	renderTags : function(tags, currentTag, tagsAmount)
	{
		var nodes = this.nodes.recommends
		
		if(!tags.length)
		{
			nodes.tags.hide()
			return
		}
		
		var df = document.createDocumentFragment()
		for (var i = 0, il = tags.length; i < il; i++) 
		{
			var tag = tags[i],
				li = N('li'), div = N('div'),
				name = Nct('span', 'name', tag), amount = Nct('span', 'amount', tagsAmount[tag])
			
			if(tag.localeCompare(currentTag) == 0)
			{
				li.addClassName('active')
			}
			else
			{
				div.tagValue = tag
			}
			div.appendChild(name)
			div.appendChild(amount)
			div.appendChild(N('b'))
			li.appendChild(div)
			df.appendChild(li)
		}
		
		nodes.tagsList.empty()
		nodes.tagsList.appendChild(df)
		nodes.tags.show()
	},
	
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
		
		if(node.hasClassName('control') && node.ingredient)
		{
			this.controller.removeIngredientFromBar(node.ingredient)
		}	
	},
	
	handleIngredientsSwitcherClick : function(e)
	{
		this.controller.switchIngredientsView(e.target.className)		
	},

	handleCocktailsSwitcherClick : function(e)
	{
		this.controller.switchCocktailsView(e.target.className)
	},
	
	handleVisibleCocktailClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('control') && node.cocktail)
		{
			this.controller.hideCocktail(node.cocktail)
		}
	},
	
	handleHiddenCocktailClick : function(e)
	{
		var node = e.target
		if(node.hasClassName('control') && node.cocktail)
		{
			this.controller.showCocktail(node.cocktail)
		}		
	},
	
/*	handleBottomWrapperClick : function(e)
	{
		var target = e.target
		
		if(!target.ingredients && !target.addingIngredient)
		{
			return
		}
		
		var recommendNode = this.findParentRecommend(target)
		
		this.recommendScrollTop = recommendNode.offsetPosition().top - window.pageYOffset
		this.currentRecommendNode = recommendNode
		
		this.controller.addIngredientFromRecommends(target.ingredient)
	},*/
	
	updateRecommends : function(cocktailsHash, ingredientsHash)
	{
		for (var i = 0, il = this.currentRecommends.length; i < il; i++) 
		{
			var recommend = this.currentRecommends[i]
			var group = recommend.group,
				dt = recommend.dt,
				dd = recommend.dd
				
			dt.empty()
			dt.appendChild(this.getTextForRecommend(group, cocktailsHash, ingredientsHash))
			
			for (var j = 0, jl = dd.cocktailsList.length; j < jl; j++) 
			{
				var item = dd.cocktailsList[j],
					node = item.node
				if(cocktailsHash[item.cocktail.name])
				{
					node.addClassName('have')
					node.removeClassName('no-have')
				}
				else
				{
					node.addClassName('no-have')
					node.removeClassName('have')				
				}
			}
			
			for (var j = 0, jl = dd.ingredientsList.length; j < jl; j++) 
			{
				var item = dd.ingredientsList[j],
					node = item.node
				if(ingredientsHash[item.ingredient.name])
				{
					node.addClassName('have')
					node.removeClassName('no-have')
				}
				else
				{
					node.addClassName('no-have')
					node.removeClassName('have')				
				}
			}
		}
		
		for (var i = 0, il = this.currentMustHaveRecommends.length; i < il; i++) 
		{
			var recommend = this.currentMustHaveRecommends[i],
				node = recommend.node
			if(ingredientsHash[recommend.ingredient.name])
			{
				node.addClassName('have')
				node.removeClassName('no-have')
			}
			else
			{
				node.addClassName('no-have')
				node.removeClassName('have')				
			}
		}
	},
	
	maybeIngredientClicked : function(target)
	{
		if(!target.parentNode)
			return
		
		var ingredient = target['data-ingredient'] || target.parentNode['data-ingredient']
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
		{
			IngredientPopup.hide()
		}
	},
	
	handleTagsClick : function(e)
	{
		var node = e.target
		var tag = node.tagValue || node.parentNode.tagValue
		if(tag)
		{
			this.controller.switchTag(tag)
		}
	},
	
	addIngredientFromRecommends : function(e)
	{
		var node = e.target
		
		if(!node.hasClassName('control') || node.parentNode.hasClassName('have'))
		{
			return
		}
		
		var recommendNode = this.findParentRecommend(node)	
		this.recommendScrollTop = recommendNode.offsetPosition().top - window.pageYOffset
		this.currentRecommendNode = recommendNode
		
		this.controller.addIngredientFromRecommends(node.ingredient)		
	},
	
	findParentRecommend : function(node)
	{
		do
		{
			if(node.recommendWrapper)
			{
				return node
			}
		}
		while((node = node.parentNode))
		
		return false
	},
	/*
		selectOtherTag : function(e)
		{
			var target = e.target
			if(target.tagValue && !target.parentNode.hasClassName('current'))
			{
				this.tagsWrapperScrollTop = this.nodes.bottomOutput.tagsCloud.offsetPosition().top - window.pageYOffset
				this.controller.showTagRecommends(target.tagValue)
			}
		},*/
	
	
	setScrollTopRecommends : function()
	{
		var scrollVal = this.currentRecommendNode.offsetPosition().top - this.recommendScrollTop
		
		document.documentElement.scrollTop = scrollVal
		document.body.scrollTop = scrollVal
	}
	
/*	setScrollTopTags : function()
	{
		var scrollVal = this.nodes.bottomOutput.tagsCloud.offsetPosition().top - this.tagsWrapperScrollTop
		
		document.documentElement.scrollTop = scrollVal
		document.body.scrollTop = scrollVal		
	}*/
}
Object.extend(Me.prototype, myProto)
})();