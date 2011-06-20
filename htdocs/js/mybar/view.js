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
		
		this.offsetTops = {}
		this.offsetHeights = {}
		
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
		nodes.ingredients.queryInput.addEventListener('focus', function(){ nodes.ingredients.hint.hide() }, false)
		nodes.ingredients.queryInput.addEventListener('blur', function(){ if(!this.value) nodes.ingredients.hint.show() }, false)
		nodes.ingredients.luckyButton.addEventListener('click', function(){ me.controller.addLuckyIngredient() }, false)
		nodes.ingredients.list.addEventListener('click', function(e){ me.tryRemoveIngredient(e) }, false)
		nodes.ingredients.switcher.addEventListener('click', function(e){ me.handleIngredientsSwitcherClick(e) }, false)
		
		nodes.maybeHave.list.addEventListener('click', function(e){ me.tryAddIngredient(e) }, false)
		
		nodes.cocktails.visible.addEventListener('click', function(e){ me.handleVisibleCocktailClick(e) }, false)
		nodes.cocktails.hiddenList.addEventListener('click', function(e){ me.handleHiddenCocktailClick(e) }, false)
		nodes.cocktails.switcher.addEventListener('click', function(e){ me.handleCocktailsSwitcherClick(e) }, false)
		
		nodes.share.wrapper.addEventListener('click', function(e){ me.handleShareClick(e) }, false)
		nodes.share.popups.email.main.addEventListener('click', function(e){ e.stopPropagation() }, false)
		nodes.share.popups.email.sendButton.addEventListener('click', function(e){ me.sendEmail(e) }, false)
		nodes.share.popups.web.main.addEventListener('click', function(e){ e.stopPropagation() }, false)
		
		this.hideEmailShare = function()
		{
			me.nodes.share.popups.email.main.hide()
			me.hideEmailShare.binded = false
			setTimeout(function(){ me.unbindShareListeners(me.hideEmailShare) }, 0)
		}
		
		this.hideWebShare = function()
		{
			me.nodes.share.popups.web.main.hide()
			me.hideWebShare.binded = false
			setTimeout(function(){ me.unbindShareListeners(me.hideWebShare) }, 0)
		}
		
		nodes.recommends.tagsList.addEventListener('click', function(e){ me.handleTagsClick(e) }, false)
		nodes.recommends.wrapper.addEventListener('click', function(e){ me.changeIngredientFromRecommends(e) }, false)
		
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
	
	showView : function()
	{
		document.documentElement.removeClassName('loading')		
	},
	
	focusSearchInput : function()
	{
		this.nodes.ingredients.queryInput.focus()
	},
	
	handleBarNameFocus : function(e)
	{
		var node = e.target
		if(!node.inited)
		{
			this.nodes.ingredients.title.advice.hide()
		}
		setTimeout(function()
		{
			node.selectionStart = 0
			node.selectionEnd = node.value.length
		}, 1)
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
		var value = e.target.value
		if(value)
		{
			this.controller.changeBarName(value)
		}
	},
	
	onscroll : function()
	{
		if(document.documentElement.hasClassName('loading'))
		{
			return
		}
		var node = this.nodes.recommends.box,
			windowOffset = window.pageYOffset,
			screenHeight = window.screen.height,
			nodeOffset = this.getOffsetTop(node),
			supply = 400
		//log('nodeOffset = ', nodeOffset, '; ', 'windowOffset = ', windowOffset, '; ', 'screenHeight = ', screenHeight)
		if(nodeOffset > windowOffset + screenHeight || windowOffset == 0)
		{
			this.controller.upgradeRecommends()
		}
		if(windowOffset - nodeOffset <= supply)
		{
			//log('top block upgrading...')
			this.savePreviousScrollTop(node)
			this.controller.upgradeTopBlock()
		}
		
		this.controller.checkoutRecommends()
		this.controller.checkoutMustHaveRecommends()
	},
	
	getOffsetTop : function(node)
	{
		var offsetTop = this.offsetTops[node]
		if(!offsetTop)
		{
			offsetTop = node.offsetPosition().top
			this.offsetTops[node] = offsetTop
		}
		return offsetTop
	},
	
/*	getOffsetHeight : function(node)
	{
		var offsetHeight = this.offsetHeights[node]
		if(!offsetHeight)
		{
			offsetHeight = node.clientHeight || node.offsetHeight
			this.offsetHeights[node] = offsetHeight
		}
		return offsetHeight
	},
	
	resetOffsetHeight : function(node)
	{
		this.offsetHeights[node] = null
	},*/

	
	resetOffsetTop : function(node)
	{
		this.offsetTops[node] = null
	},
	
	resetRecommendsOffsets : function()
	{
		this.resetOffsetTop(this.nodes.recommends.recommendsList)
		this.resetOffsetTop(this.nodes.recommends.mustHaveList)
		this.resetOffsetTop(this.nodes.recommends.box)
	},
	
/*	resetRecommendsOffsetHeight : function()
	{
		this.resetOffsetHeight(this.nodes.recommends.recommendsList)
		this.resetOffsetHeight(this.nodes.recommends.mustHaveList)
	},*/

	
	checkoutRecommends : function(listLength)
	{
		var node = this.nodes.recommends.recommendsList,
			supply = 400
		
		while(listLength > 0 && this.getSupply(node) < supply)
		{
			var i = 4
			while(i-- && listLength--)
			{
				this.controller.addRecommend()
			}
		}
		
		var rn = this.nodes.recommends.box
		rn.style.height = 'auto'
	},
	
	checkoutMustHaveRecommends : function(listLength)
	{
		var node = this.nodes.recommends.mustHaveList,
			supply = 400
			
		while(listLength > 0 && this.getSupply(node) < supply)
		{
			var i = 4
			while(i-- && listLength--)
			{
				this.controller.addMustHaveRecommend()
			}
		}
		
		var rn = this.nodes.recommends.box
		rn.style.height = 'auto'
	},
	
	getSupply : function(node)
	{
		return node.offsetHeight + this.getOffsetTop(node) - window.screen.height - window.pageYOffset
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
			nodes.barName.value = barName
			nodes.barName.inited = true
			nodes.advice.hide()
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
			this.resetRecommendsOffsets()
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
				break
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
		
		this.resetRecommendsOffsets()
	},
	
	renderMaybeHave : function(ingredients, ingredientsHash)
	{
		if(!ingredients)
		{
			return
		}
		
		var nodes = this.nodes.maybeHave
		if(this.maybeHaveBoxScrollTop)
		{
			var scrollVal = nodes.box.offsetPosition().top - this.maybeHaveBoxScrollTop
			
			document.documentElement.scrollTop = scrollVal
			document.body.scrollTop = scrollVal			
			this.maybeHaveBoxScrollTop = false
		}
		
		var	ul = Nc('ul', 'by-list')
		for(var i = 0, il = ingredients.length; i < il; i++)
		{
			var ingredient = ingredients[i]
			ul.appendChild(ingredients[i].getPreviewNodeExt(ingredientsHash[ingredient.name]))
		}
		
		nodes.list.empty()
		nodes.list.appendChild(ul)
		nodes.box.show()
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
			//nodes.wrapper.hide()
			//nodes.switcher.hide()
			//nodes.title.h2.className = 'zero-cocktails'
			//nodes.links.hide()
			//nodes.empty.show()
			nodes.box.hide()
			this.resetRecommendsOffsets()
			return
		}
		
		nodes.title.plural.firstChild.nodeValue = cl + ' ' + cl.plural('коктейля', 'коктейлей', 'коктейлей')
		//nodes.title.h2.className = ''
		//nodes.links.show()
		//nodes.empty.hide()
		nodes.switcher.className = 'switcher ' + showType
		
		switch(showType)
		{
			case 'by-ingredients':
			{
				this.incl.setCocktails([{cocktails : visibleCocktails}])
				break
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
				break
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
		nodes.box.show()
		this.resetRecommendsOffsets()
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

	renderShareLinks : function(userid)
	{
		var nodes = this.nodes.share
		var url = window.location.protocol + '//' + window.location.hostname + '/mybar/foreign.html#' + userid
		nodes.links.facebook.href = nodes.links.facebook.href.replace('mybarlink', UrlEncode.stringify({ u : url }))
		nodes.links.twitter.href = nodes.links.twitter.href.replace('mybarlink', UrlEncode.stringify({ url : url }))
		var textValue = nodes.popups.email.text.innerHTML.replace('mybarlink', url)
		nodes.popups.email.text.innerHTML = textValue
		nodes.popups.web.input.value = url
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

	prepareRecommends : function(clearNodes)
	{	
		this.currentRecommends = []
		this.currentMustHaveRecommends = []
		this.nodes.recommends.recommendsList.empty()
		this.nodes.recommends.mustHaveList.empty()
		this.resetRecommendsOffsets()
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
		setTimeout(function(){ dt.style.height = dt.offsetHeight - 26 + 'px' }, 0)
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
		
		{
			if(havingIngredients.length != 0)
			{
				text.appendChild(T('В твоем баре уже есть '))
				text.appendChild(this.createIngredientsTextFromArr(havingIngredients))
				text.appendChild(T('. '))
			}
			else
			{
				text.appendChild(T('В твоем баре не хватает ингредиентов.'))
			}
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
		if(ingredients.length > 5)
		{
			var span = Nct('span', 'pink', 'много ингредиентов')
			return span
		}
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
	
	renderIfCocktailsEmpty : function()
	{
		var c = this.nodes.cocktails
		c.block.hide()
	},
	
	clearInput : function()
	{
		this.nodes.ingredients.queryInput.value = ''
	},
	
	tryAddIngredient : function(e)
	{
		var node = e.target
		if(node.hasClassName('control') && node.ingredient && node.parentNode.hasClassName('no-have'))
		{
			this.maybeHaveBoxScrollTop = this.nodes.maybeHave.box.offsetPosition().top - window.pageYOffset
			this.controller.addIngredientToBar(node.ingredient)
		}
	},
	
	tryRemoveIngredient : function(e)
	{
		var node = e.target
		
		if(node.hasClassName('control') && node.ingredient && node.parentNode.hasClassName('have'))
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
		
		this.onscroll()
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
			var rn = this.nodes.recommends.box
			rn.style.height = rn.offsetHeight + 'px'
			this.controller.switchTag(tag)
		}
	},
	
	changeIngredientFromRecommends : function(e)
	{
		var node = e.target
		
		if(!node.hasClassName('control') || !node.ingredient)
		{
			return
		}
		
		var recommendNode = this.findParentRecommend(node)
		this.savePreviousScrollTop(recommendNode)
		if(node.parentNode.hasClassName('no-have'))
		{
			this.controller.addIngredientFromRecommends(node.ingredient)
		}
		else
		{
			this.controller.removeIngredientFromRecommends(node.ingredient)
		}
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
	
	savePreviousScrollTop : function(node)
	{
		this.prevScrollTop = { node : node, pos : node.offsetPosition().top - window.pageYOffset }
	},
	
	setScrollTop : function()
	{
		var scrollVal = this.prevScrollTop.node.offsetPosition().top - this.prevScrollTop.pos
		
		document.documentElement.scrollTop = scrollVal
		document.body.scrollTop = scrollVal
	},
	
	handleShareClick : function(e)
	{
		var nodes = this.nodes.share,
			node = e.target,
			me = this
		
		e.preventDefault()
		
		switch(e.target.className)
		{
			case 'facebook-share':
			case 'twitter-share':
			{
				this.openWindow(node.href)
				break;
			}
			case 'email-share':
			{
				this.emailShareShow()
				break;
			}
			case 'web-share':
			{
				this.webShareShow()
				break;
			}
		}
	},
	
	emailShareShow : function(userid)
	{
		var me = this
		this.nodes.share.popups.email.main.show()
		setTimeout(function(){ me.bindShareListeners(me.hideEmailShare) }, 0)
	},
	
	webShareShow : function(userid)
	{
		var me = this
		this.nodes.share.popups.web.main.show()
		setTimeout(function(){ me.bindShareListeners(me.hideWebShare) }, 0)
	},
	
	bindShareListeners : function(callback)
	{
		if(callback.binded)
		{
			return
		}
		callback.binded = true
		document.addEventListener('click', callback, false)
	},
	
	unbindShareListeners : function(callback)
	{
		document.removeEventListener('click', callback, false)
		callback.binded = false
	},
	
	openWindow : function(url)
	{
		var w = 550,
			h = 450,
			sh = window.screen.height,
			sw = window.screen.width,
			left = Math.round((sw-w)/2),
			top = sh > h ? Math.round((sh-h)/2) : 0
			
		window.open(url, '', 'left=' + left + ',top=' + top + ',width=' + w + ',height=' + h + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1')
	},
	
	sendEmail : function(e)
	{
		var node = e.target
		if(node.hasClassName('sending'))
		{
			return
		}
		node.addClassName('sending')
		var nodes = this.nodes.share.popups.email,
			address = nodes.address.value,
			mailer = nodes.mailer.value,
			text = nodes.text.innerHTML
		this.controller.sendEmail(address, mailer, text)
	},
	
	emailSended : function()
	{
		var nodes = this.nodes.share.popups.email
		nodes.sendButton.hide()
		nodes.emailSended.show()
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