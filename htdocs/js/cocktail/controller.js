Array.prototype.random = function() {
	var len = this.length
	if (len)
		return this[Math.round(Math.random() * (len - 1))]
}

var Controller = {
	NAME_ELEM  : 'cocktail_name',
	ID_REC     : 'recommendations',
	ID_REC_SUR : 'rec_surface',
	
	ID_ILLUSTRATION : 'cocktail-image',
	
	ID_AUTHOR : 'author',
	SELECTOR_AUTHOR : 'a.author',
	ID_WHERE_TO_TASTE : 'where-to-taste',
	
	ID_RELATED : 'related',
	ID_REL_SUR : 'rel_surface',
	ID_REL_VPR : 'rel_viewport',
	
	ID_ING       : 'ingredients',
	ID_ING_SUR   : 'ingreds_surface',
    ID_INGS_LIST : 'ingredients_list',
	
	REL_WIDTH_SMALL : '330px',
	REL_WIDTH_BIG   : '560px',
	
	ID_CART_EMPTY   : 'cart_draghere',
	ID_CART_FULL    : 'cart_contents',
	
	CLASS_PRINT_RECIPE : '.bt-print-how',
	KEY_ESC: 27,
	
	name : "",
	relatedCount: 10,
	lastFrame: 'state-initial',
	defaultFrame: 'state-initial',
	
	nodes:
	{
		moreBox: $('b-more'),
		hreview: $$('.hreview')[0],
		showRecipe: $('show-recipe'),
		hideRecipe: $('close-recipe'),
		showLegendBtn: $('show-legend'),
		hideLegendBtn: $('hide-legend'),
		tags: $$('#main-content .tags .tag'),
		recommendations:
		{
			root: $('recommendations'),
			viewport: $$('#recommendations .viewport')[0],
			surface: $$('#recommendations .surface')[0],
			prev: $$('#recommendations .prev')[0],
			next: $$('#recommendations .next')[0]
		}
	},
	
	init: function(){
		this.name = $(this.NAME_ELEM).getAttribute('data-cocktail-name');
		this.DROP_TARGETS = [$(this.ID_CART_EMPTY), $(this.ID_CART_FULL)];
		new Draggable($(this.ID_ILLUSTRATION), this.name, this.DROP_TARGETS);
	    
		this.lh = new LocationHash().bind(window)
		Model.dataListener = this;
		this.bindEvents(this.name);
		Model.init(this.name);
		var perPage = 5;
		if(Model.recs.length > 0) {
			this.renderRecommendations(Model.recs);
			perPage = 3;
		} else this.expandRelated();
		this.renderRelated(perPage);
		this.renderIngredients(Model.ingredients);
		this.renderTags()
		this.renderFrame()
	},
	
	frames:
	{
		'state-recipe': function ()
		{
			Statistics.cocktailViewRecipe(Cocktail.getByName(this.name))
			
			var ri = $(this.ID_ING).RollingImagesLite
			if (ri)
				ri.goInit(); // Work-around for RI: FIXME
		},
		'state-legend': function ()
		{
			Statistics.cocktailViewLegend(Cocktail.getByName(this.name))
		},
		'state-initial': function () {}
	},
	
	changeHashReaction: function (state)
	{
		state = state || this.defaultFrame
		
		var frame = this.frames[state]
		if (!frame)
			return
		
		var root = this.nodes.hreview
		root.removeClassName(this.lastFrame)
		root.addClassName(state)
		
		this.lastFrame = state
		
		frame.call(this)
	},
	
	changeFrame: function (state)
	{
		this.changeHashReaction(state)
		
		if (state == this.defaultFrame)
			this.lh.set('')
		else
			this.lh.set(state)
	},
	
	renderFrame: function ()
	{
		this.changeHashReaction(this.lh.get())
	},
	
	bindEvents: function(name){
		var self = this;
		
		var barman = Barman.getByCocktailName(name)
		if (barman)
		{
			var a = $(this.ID_AUTHOR)
			if (a)
			{
				a.removeClassName('hidden')
				a.href = barman.pageHref()
			}
			
			
			a = $$(this.SELECTOR_AUTHOR)[0]
			if (a)
			{
				a.addClassName('active')
				a.href = barman.pageHref()
			}
		}
		
		var bars = Bar.getByCocktailName(name)
		if (bars.length)
		{
			var a = $(this.ID_WHERE_TO_TASTE)
			a.removeClassName('hidden')
			
			if (bars.length == 1)
			{
				a.href = bars[0].pageHref()
			}
			else
			{
				a.href = '/bars.html#cocktail=' + encodeURIComponent(name)
			}
		}
		
		this.lh.addEventListener('change', function (e)
		{
			self.renderFrame()
		},
		false)
		
		this.nodes.showRecipe.addEventListener('click', function (e)
		{
			self.changeFrame('state-recipe')
		},
		false)
		
		this.nodes.hideRecipe.addEventListener('click', function (e)
		{
			self.changeFrame('state-initial')
		},
		false)
		
		if (this.nodes.showLegendBtn)
		{
			this.nodes.showLegendBtn.addEventListener('click', function (e)
			{
				self.changeFrame('state-legend')
			},
			false)
			
			this.nodes.hideLegendBtn.addEventListener('click', function (e)
			{
				self.changeFrame('state-initial')
			},
			false)
		}
		
		var printRecipe = $$(this.CLASS_PRINT_RECIPE)[0]
		printRecipe.addEventListener('click', function (e)
		{
			window.open('/print_cocktail.html#' + encodeURIComponent(self.name))
		}, false);
		
		var tools_links = $$(".b-content .tools dd a");
		for (var i = 0; i < tools_links.length; i++){
			var tool = Ingredient.getByName(tools_links[i].innerHTML)
			// FIXME: dirty fix for invalid tool name
			// was cached in html while js had been updated
			if (!tool)
			{
				tools_links[i].parentNode.hide()
				continue
			}
			tools_links[i].addEventListener('click', function(tool){ return function(e){
				self.showIngredientPopup(tool)
			}}(tool), false);
		}
	
		$(self.ID_INGS_LIST).addEventListener('click', function (e) { self.mayBeIngredientClicked(e.target) }, false)
    },
	
	mayBeIngredientClicked: function (node)
	{
		var name = node.getAttribute('data-ingredient-name')
		var ingredient = Ingredient.getByName(name)
		if (ingredient)
			this.showIngredientPopup(ingredient)
	},
	
	renderTags: function ()
	{
		var tags = this.nodes.tags
		for (var i = 0, il = tags.length; i < il; i++)
		{
			var tag = tags[i]
			
			var query = tag.getAttribute('data-tag')
			if (!query)
				continue
			
			tag.href = "/combinator.html#q=" + query
		}
	},

	renderRecommendations: function (recs)
	{
		var nodes = this.nodes.recommendations
		var surface = nodes.surface
		var items = []
		var size = recs.length
		
		for (var i = 0; i < recs.length; i++)
		{
			var item = this._createRecommendationElement(recs[i], i)
			items[i] = item
			surface.appendChild(item)
		}
		
		var tail = items[0].cloneNode(true)
		items.push(tail)
		surface.appendChild(tail)
		
		
		var list = new LazyList()
		list.bind(nodes)
		list.configure({friction: 5, pageVelocity: 18, soft: Infinity, min: 75, max: 100})
		list.setNodes(items, size)
		
		if (size <= 1)
		{
			nodes.next.addClassName('disabled')
			nodes.prev.addClassName('disabled')
			return
		}
		
		this.setupCarousel(nodes, list)
	},
	
	setupCarousel: function (nodes, list)
	{
		var carousel =
		{
			timeout: 2600,
			start: function ()
			{
				function goNext ()
				{
					list.goNext()
					carousel.start()
				}
				carousel.cycle = setTimeout(goNext, carousel.timeout)
			},
			stop: function ()
			{
				clearTimeout(carousel.cycle)
			}
		}
		
		nodes.root.addEventListener('mouseover', carousel.stop)
		nodes.root.addEventListener('mouseout', carousel.start)
		carousel.start()
	},
	
	_createRecommendationElement: function (rec, num)
	{
		var point = document.createElement("a");
		point.className = "point";
		point.id = "rec_"+(num+1);
        point.href = Ingredient.ingredientsLinkByMark(rec.mark);
		
		var mark = Mark.getByName(rec.mark)
		if (mark)
		{
			var banner = document.createElement('img')
			banner.src = mark.getBannerSrc()
			banner.alt = mark.name
			point.appendChild(banner)
		}
		else
			point.appendChild(document.createTextNode(rec.mark))
		
		return point;	
	},
	
	renderRelated: function (perPage)
	{
		var resultSet = Model.related,
			root = $(this.ID_REL_VPR)
		
		root.style.width = (perPage == 3) ? this.REL_WIDTH_SMALL : this.REL_WIDTH_BIG;
		
		$(this.ID_REL_SUR).empty()
		var np = this._getNumOfPages(resultSet, perPage);
		for(var i = 1; i <= np; i++) {
			var selectedSet = resultSet.slice((i-1)*perPage, i*perPage);
			this._renderPage(selectedSet, i, perPage);
		}
		$(this.ID_RELATED).RollingImagesLite.sync();
		$(this.ID_RELATED).RollingImagesLite.goInit();
	},

	showIngredientPopup: function (ingredient)
	{
		IngredientPopup.show(ingredient)
	},
	
	renderIngredients: function(ingredients) {
		var perPage = 3;
		var np = this._getNumOfPages(ingredients, perPage);
		
		for(var i = 1; i <= np; i++) {
			var selectedSet = ingredients.slice((i-1)*perPage, i*perPage);
			this._renderIngPage(selectedSet, i);
		}
		
		$(this.ID_ING).RollingImagesLite.sync();
		$(this.ID_ING).RollingImagesLite.goInit();
	},
	
	_renderIngPage: function(resultSet, pageNum) {
		var self = this;
        var parent = $(this.ID_ING_SUR);
		var div = document.createElement("div");
		div.className = "point";
		div.id = "ing_" + pageNum;
		parent.appendChild(div);
		
		for (var i = 0; i < resultSet.length; i++)
		{
			var ingredient = resultSet[i]
			var img = document.createElement("div");
			img.className = 'image'
			img.style.backgroundImage = 'url(' + ingredient.getMiniImageSrc() + ')'
			img.alt = ingredient.name;
            img.addEventListener('click', function(ingredient) { return function(){
                self.showIngredientPopup(ingredient);
            }}(ingredient), false);
			div.appendChild(img);
		}
	},
	
	_getNumOfPages: function(resultSet, perPage) {
		if ((resultSet.length % perPage) == 0) return (resultSet.length/perPage);
		return parseInt(resultSet.length / perPage) + 1;
	},
	
	_renderPage: function(resultSet, pageNum, perPage){
		var parent = $(this.ID_REL_SUR);
		
		var page = document.createElement("div");
		page.id = "page_" + pageNum;
		page.className = "point";
		page.style.width = (perPage == 3) ? this.REL_WIDTH_SMALL : this.REL_WIDTH_BIG;
		parent.appendChild(page);
		
		var ul = document.createElement("ul");
		ul.id = "ul_" + pageNum;
		page.appendChild(ul);
		
		for (var i = 0; i < resultSet.length; i++) {
			ul.appendChild(this._createCocktailElement(resultSet[i]));
		}
	},
	
	_createCocktailElement: function (cocktail)
	{
		var node = cocktail.getPreviewNode()
		new Draggable(node.img, cocktail.name, this.DROP_TARGETS)
		return node
	},
	
	expandRelated: function ()
	{
		this.nodes.moreBox.addClassName('wide')
	}
}
