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
	
	INGRED_POPUP : 'shop-cocktail',
	TOOL_POPUP   : 'shop-gadget',
	
	ID_CART_EMPTY   : 'cart_draghere',
	ID_CART_FULL    : 'cart_contents',
	
	CLASS_PRINT_RECIPE : '.bt-print-how',
	KEY_ESC: 27,
	
	name : "",
	relatedCount: 10,
	
	nodes:
	{
		hreview: $$('.hreview')[0],
		showRecipe: $('show-recipe'),
		hideRecipe: $('close-recipe'),
		showLegendBtn: $('show-legend'),
		hideLegendBtn: $('hide-legend')
	},
	
	init: function(){
		this.name = $(this.NAME_ELEM).getAttribute('data-cocktail-name');
		this.DROP_TARGETS = [$(this.ID_CART_EMPTY), $(this.ID_CART_FULL)];
		new Draggable($(this.ID_ILLUSTRATION), this.name, this.DROP_TARGETS);
	    
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
		
		this.nodes.showRecipe.addEventListener('click', function(e){
			Statistics.cocktailViewRecipe(Cocktail.getByName(self.name))
			
			var root = self.nodes.hreview
			root.removeClassName('state-initial')
			root.addClassName('state-recipe')
			
			var ri = $(self.ID_ING).RollingImagesLite
			if (ri)
				ri.goInit(); // Work-around for RI: FIXME
		}, false);
		
		this.nodes.hideRecipe.addEventListener('click', function (e)
		{
			var root = self.nodes.hreview
			root.removeClassName('state-recipe')
			root.addClassName('state-initial')
		},
		false)
		
		if (this.nodes.showLegendBtn)
		{
			this.nodes.showLegendBtn.addEventListener('click', function (e)
			{
				Statistics.cocktailViewLegend(Cocktail.getByName(self.name))
			
				var root = self.nodes.hreview
				root.removeClassName('state-initial')
				root.addClassName('state-legend')
			},
			false)
			
			this.nodes.hideLegendBtn.addEventListener('click', function (e)
			{
				var root = self.nodes.hreview
				root.removeClassName('state-legend')
				root.addClassName('state-initial')
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
			var tool = Tool.getByName(tools_links[i].innerHTML)
			// FIXME: dirty fix for invalid tool name
			// was cached in html while js had been updated
			if (!tool)
			{
				tools_links[i].parentNode.hide()
				continue
			}
			tools_links[i].addEventListener('click', function(name){ return function(e){	
				$(self.TOOL_POPUP).show();
				self.renderToolPopup(name);
			}}(tool), false);
		}
	
        document.documentElement.addEventListener('keyup', function(e){
            if(e.keyCode == self.KEY_ESC) $(self.TOOL_POPUP).hide();
        }, false);
	
		$$("#shop-gadget .opacity")[0].addEventListener('click', function(e){
		    $(self.TOOL_POPUP).hide();	
		}, false);
		
        $('tool_cancel').addEventListener('mousedown', function(e){
			$(self.TOOL_POPUP).hide();
		}, false);
		
		$(self.ID_INGS_LIST).addEventListener('click', function (e) { self.mayBeIngredientClicked(e.target) }, false)
    },
	
	mayBeIngredientClicked: function (node)
	{
		var name = node.getAttribute('data-ingredient-name')
		if (name)
			this.showPopup(name)
	},
	
	renderToolPopup: function(tool){
		Statistics.toolPopupOpened(tool)
		var good = Good.getBySellName(tool.name)[0]
		
		if (good)
		{
			$('tool_buy').parentNode.show()
			$('tool_buy').href = good.getHref()
			$('tool_buy').innerHTML = good.name
		}
		else
			$('tool_buy').parentNode.hide()
		
		
		$('tool_name').innerHTML = tool.name;
		$('tool_desc').innerHTML = tool.desc;
		$('tool_picture').src = tool.imgSrc();
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

	showPopup: function(name)
	{
		IngredientPopup.show(Ingredient.getByName(name))
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
			var ingredient = Ingredient.getByName(resultSet[i][0])
			var img = document.createElement("div");
			img.className = 'image'
			img.style.backgroundImage = 'url(' + ingredient.getMiniImageSrc() + ')'
			img.alt = ingredient.name;
            img.addEventListener('click', function(name) { return function(){
                self.showPopup(name);
            }}(ingredient.name), false);
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
	
	expandRelated: function(){ // model
		var recsCol = $$(".column.b-more-rec")[0];
		var relCol  = $$(".column.b-more-cocktails")[1];
		recsCol.style.display = "none";
		relCol.style.width = "62.8em";
	}
}
