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
	
	nodes:
	{
		moreBox: $('b-more'),
		hreview: $$('.hreview')[0],
		showRecipe: $('show-recipe'),
		hideRecipe: $('close-recipe'),
		showLegendBtn: $('show-legend'),
		hideLegendBtn: $('hide-legend'),
		tags: $$('#main-content .tags .tag')
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
		if ( this.lh.get() != '' )
			this.renderFrame()
	},
	
	frames: [
		{
			cl: 'state-recipe',
			hash: 'showme-recipe',
			doit: function(){
				Statistics.cocktailViewRecipe(Cocktail.getByName(this.name))
				
				var ri = $(this.ID_ING).RollingImagesLite
				if (ri)
					ri.goInit(); // Work-around for RI: FIXME
			}
		},
		{
			cl: 'state-legend',
			hash: 'showme-legend',
			doit: function(){
				Statistics.cocktailViewLegend(Cocktail.getByName(this.name))
			}
		},
		{
			cl: 'state-initial',
			hash: '',
			doit: function(){
				//if ( typeof window.history.replaceState === 'function' )
				//	window.history.replaceState('page', '', window.location.href.replace( /#.*/, ""))
			}
		}
	],
	
	changeFrame: function(key, val){
		var self = this,
			root = self.nodes.hreview,
			frames = self.frames
		
		for(var i = 0, fl = frames.length; i < fl; i++)
		{
			if(key in frames[i] && frames[i][key] == val)
			{
				root.removeClassName(self.lastFrame)
				root.addClassName(frames[i].cl)
				self.lastFrame = frames[i].cl
				frames[i].doit.call(self)
				if ( self.lh.get() != frames[i].hash ) self.lh.set(frames[i].hash)
				return
			}
		}
	},
	
	renderFrame: function(){
		var self = this
		
		self.changeFrame('hash', self.lh.get())
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
		
		this.lh.addEventListener('change', function (e) {
			self.renderFrame()
		}, false)
		
		this.nodes.showRecipe.addEventListener('click', function(e){
			self.changeFrame('cl', 'state-recipe')
		}, false);
		
		this.nodes.hideRecipe.addEventListener('click', function (e)
		{
			self.changeFrame('cl', 'state-initial')
		},
		false)
		
		if (this.nodes.showLegendBtn)
		{
			this.nodes.showLegendBtn.addEventListener('click', function (e)
			{
				self.changeFrame('cl', 'state-legend')
			},
			false)
			
			this.nodes.hideLegendBtn.addEventListener('click', function (e)
			{
				self.changeFrame('cl', 'state-initial')
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
	
	renderRecommendations: function(recs){
		var ri = $(this.ID_REC).RollingImagesLite;
		var parent = $(this.ID_REC_SUR);
		
		for(var i = 0; i < recs.length; i++){
			var div = this._createRecommendationElement(recs[i], i);
			parent.appendChild(div);
		}
		
		if(recs.length > 1){
			parent.appendChild(this._createRecommendationElement(recs[0], i));
			switchFrame = function(){
				var len = ri.points.length
				var cur = ri.current
				
				if(cur == len-2) {
					var animation = ri.goToFrame(cur+1);
					animation.oncomplete = function(){
						ri.goToFrame(0, 'directJump');
					};
				} else {
					ri.goToFrame(cur+1);
				}
			}
			var frameSwitchTimer = setInterval(switchFrame, 2500);
			var removedLast = false;
			parent.addEventListener('mouseover', function(){ 
				clearInterval(frameSwitchTimer);
				if(!removedLast){
					parent.removeChild(parent.lastChild);
					ri.sync();
					removedLast = true;
				}
			}, false);
		}
		ri.sync();
		ri.goInit();
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
