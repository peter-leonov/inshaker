Array.prototype.random = function() {
	var len = this.length
	if (len)
		return this[Math.round(Math.random() * (len - 1))]
}

var Controller = {
	REL_WIDTH_SMALL : '330px',
	REL_WIDTH_BIG   : '560px',
	
	KEY_ESC: 27,
	
	name : "",
	relatedCount: 10,
	lastFrame: 'state-recipe',
	defaultFrame: 'state-recipe',
	
	nodes:
	{
		moreBox: $('#b-more'),
		hreview: $('.hreview'),
		showRecipe: $('#show-recipe'),
		hideRecipe: $('#close-recipe'),
		showLegendBtn: $('#show-legend'),
		hideLegendBtn: $('#hide-legend'),
		whereToBuy: $('#where-to-buy'),
		tags: $$('#main-content .tags .tag'),
		recommendations:
		{
			root: $('#recommendations'),
			viewport: $('#recommendations .viewport'),
			surface: $('#recommendations .surface'),
			prev: $('#recommendations .prev'),
			next: $('#recommendations .next')
		}
	},
	
	init: function(){
		var cocktailName = this.name = $('#cocktail_name').getAttribute('data-cocktail-name');
		
		function onDragStart (e)
		{
			e.dataTransfer.setData('text', cocktailName)
		}
		$('#cocktail-image').addEventListener('dragstart', onDragStart, false)
		
		this.lh = new LocationHash().bind()
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
		
		this.changeHashReaction(this.lh.get())
	},
	
	frames:
	{
		'state-recipe': function ()
		{
			Statistics.cocktailViewRecipe(Cocktail.getByName(this.name))
			
			var ri = $('#ingredients').RollingImagesLite
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
		if (!state)
			state = this.defaultFrame
		
		// do nothig for unknown state frame
		if (!this.frames[state])
			return
		
		this.renderFrame(state)
	},
	
	renderFrame: function (frame)
	{
		var root = this.nodes.hreview
		root.classList.remove(this.lastFrame)
		root.classList.add(frame)
		
		this.lastFrame = frame
		
		this.frames[frame].call(this)
	},
	
	changeFrame: function (state)
	{
		this.renderFrame(state)
		
		if (state == this.defaultFrame)
			this.lh.set('')
		else
			this.lh.set(state)
	},
	
	bindEvents: function(name){
		var self = this;
		
		var barman = Barman.getByCocktailName(name)
		if (barman)
		{
			var a = $('#main-content .author')
			if (a)
			{
				a.classList.remove('hidden')
			}
			
			var a = $('#main-content .author .name')
			if (a)
			{
			  a.href = barman.pageHref()
			  a.innerHTML = barman.name
			}
		}
		
		// var bars = Bar.getByCocktailName(name)
		// if (bars.length)
		// {
		// 	var a = $('#where-to-taste')
		// 	a.classList.remove('hidden')
		// 	
		// 	if (bars.length == 1)
		// 	{
		// 		a.href = bars[0].pageHref()
		// 	}
		// 	else
		// 	{
		// 		a.href = '/bars.html#cocktail=' + encodeURIComponent(name)
		// 	}
		// }
		
		this.lh.addEventListener('change', function (e)
		{
			self.changeHashReaction(this.get())
		},
		false)
		
		this.nodes.whereToBuy.addEventListener('click', function (e)
		{
			window.location.href = '/shop/'
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
	
		$('#ingredients_list').addEventListener('click', function (e) { self.mayBeIngredientClicked(e.target) }, false)
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
		list.configure({friction: 7, pageVelocity: 150, soft: Infinity, min: 75, max: 100})
		list.setNodes(items, size)
		
		if (size <= 1)
		{
			nodes.next.classList.add('disabled')
			nodes.prev.classList.add('disabled')
			return
		}
		
		this.setupCarousel(nodes, list)
	},
	
	setupCarousel: function (nodes, list)
	{
		var carousel =
		{
		  changeNTimes: 15,
			timeout: 5000,
			start: function ()
			{
			  // safe the battery life
				if (--carousel.changeNTimes < 0)
					return
				
				function goNext ()
				{
					list.goNext(80 * (1 + Math.random()))
					carousel.start()
				}
				carousel.cycle = window.setTimeout(goNext, carousel.timeout)
				
				// increase the timeout exponentially to avoid the crazy spinning
				carousel.timeout *= 1.2
			},
			stop: function ()
			{
				window.clearTimeout(carousel.cycle)
			}
		}
		
		nodes.root.addEventListener('mouseover', carousel.stop, false)
		nodes.root.addEventListener('mouseout', carousel.start, false)
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
			root = $('#rel_viewport')
		
		root.style.width = (perPage == 3) ? this.REL_WIDTH_SMALL : this.REL_WIDTH_BIG;
		
		$('#rel_surface').empty()
		var np = this._getNumOfPages(resultSet, perPage);
		for(var i = 1; i <= np; i++) {
			var selectedSet = resultSet.slice((i-1)*perPage, i*perPage);
			this._renderPage(selectedSet, i, perPage);
		}
		$('#related').RollingImagesLite.sync();
		$('#related').RollingImagesLite.goInit();
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
		
		$('#ingredients').RollingImagesLite.sync();
		$('#ingredients').RollingImagesLite.goInit();
	},
	
	_renderIngPage: function(resultSet, pageNum) {
		var self = this;
        var parent = $('#ingreds_surface');
		var div = document.createElement("div");
		div.className = "point";
		div.id = "ing_" + pageNum;
		parent.appendChild(div);
		
		for (var i = 0; i < resultSet.length; i++)
		{
			var ingredient = resultSet[i],
				url = ingredient.getMiniImageSrc()
			
			var img = document.createElement("div");
			img.className = 'image'
			img.style.backgroundImage = 'url(' + url + ')'
			
			var image = document.createElement('img')
			image.src = url
			img.appendChild(image)
			
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
		var parent = $('#rel_surface');
		
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
		
		function onDragStart (e)
		{
			e.dataTransfer.setData('text', cocktail.name)
		}
		node.addEventListener('dragstart', onDragStart, false)
		
		return node
	},
	
	expandRelated: function ()
	{
		this.nodes.moreBox.classList.add('wide')
	}
}
