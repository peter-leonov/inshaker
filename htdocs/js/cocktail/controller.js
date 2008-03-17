var Controller = {
	ID_REC     : 'recommendations',
	ID_REC_SUR : 'rec_surface',
	
	ID_RELATED : 'related',
	ID_REL_SUR : 'rel_surface',
	ID_REL_VPR : 'rel_viewport',
	
	ID_ING     : 'ingredients',
	ID_ING_SUR : 'ingreds_surface',
	
	REL_WIDTH_SMALL : '330px',
	REL_WIDTH_BIG   : '560px',
	
	PATH_MERCH : '/i/merchandise/',
	
	name : "",
	relatedCount: 10,
	
	init: function(name){
		Model.dataListener = this;
		this.bindEvents();
		Model.init(name);
		var perPage = 5;
		if(Model.recs.length > 0) {
			this.renderRecommendations(Model.recs);
			perPage = 3;
		}
		this.renderRelated(Model.getRelated(this.relatedCount), perPage);
		this.renderIngredients(Model.ingredients, Model.goods);
	},
	
	bindEvents: function(){
		var self = this;
		var menu = $('panel_cocktail');
		menu.now = menu; 
		this._initNavigationRules(menu);
		
		var mybar_links	= menu.getElementsByTagName('a');
		for (var i = mybar_links.length - 1; i >= 0; i--) {
			mybar_links[i].addEventListener('click', function(e) {
					link.open(this);
					this.parentNode.now.remClassName('now');
					this.addClassName('now');
					this.parentNode.now = this;
					$(self.ID_ING).RollingImages.goInit(); // Work-around for RI: FIXME
					e.preventDefault();
				}, false);
		}
		link = new Link();
	},
	
	_initNavigationRules: function(menu){
		// TODO: remove UI fixes from Controller
		var entry = cssQuery("#cocktail-page .hreview .entry")[0];
		var ul = cssQuery("#cocktail-page #view-how ul")[0];
		var hreview = cssQuery("#cocktail-page .hreview")[0]; 

		$('view-prepare').show = function()
		{
			$('main-content').style.visibility = 'hidden';
			this.style.display = 'block';
		}
		$('view-prepare').hide = function()
		{
			this.style.display = 'none';
			$('main-content').style.visibility = 'visible';
		}
		$('view-how').show = function()
		{
			$('main-content').className = 'view-how';
			this.style.display = 'block';
			$('poster').style.visibility = 'hidden';
			
			// Apply fix
			if(ul.offsetHeight > 130) entry.style.height = (ul.offsetHeight + 60) + "px";
		}
		$('view-how').hide = function()
		{
			this.style.display = 'none';
			$('main-content').className = '';
			$('poster').style.visibility = 'visible';
			menu.now.remClassName('now');
			
			// Cancel fix
			entry.style.height = "";
		}

		$('view-video').show = function()
		{
			this.style.display = 'block';
			$('main-content').className = 'view-video';
			$('poster').style.visibility = 'hidden';
			
			// Apply fix
			hreview.style.height = (this.offsetHeight + 38) + "px";
		}

		$('view-video').hide = function()
		{
			this.style.display = 'none';
			$('main-content').className = '';
			$('poster').style.visibility = 'visible';
			menu.now.remClassName('now');
			
			// Cancel fix
			hreview.style.height = "";
		}	
	},
	
	renderRecommendations: function(recs){
		var parent = $(this.ID_REC_SUR);
		
		for(var i = 0; i < recs.length; i++){
			var div = document.createElement("div");
			div.className = "point";
			div.id = "rec_"+(i+1);
			var img = document.createElement("img");
			img.src = this.PATH_MERCH + "banners/" + recs[i].banner;
			img.alt = recs[i].brand;
			div.appendChild(img);
			parent.appendChild(div);
		}

		
		$(this.ID_REC).RollingImages.sync();
		$(this.ID_REC).RollingImages.goInit();
	},
	
	renderRelated: function(resultSet, perPage){
		$(this.ID_REL_VPR).style.width = (perPage == 3) ? this.REL_WIDTH_SMALL : this.REL_WIDTH_BIG;
		
		var np = this._getNumOfPages(resultSet, perPage);
		for(var i = 1; i <= np; i++) {
			var selectedSet = resultSet.slice((i-1)*perPage, i*perPage);
			this._renderPage(selectedSet, i, perPage);
		}
		$(this.ID_RELATED).RollingImages.sync();
		$(this.ID_RELATED).RollingImages.goInit();
	},
	
	renderIngredients: function(ingredients, goods) {
		var perPage = 3;
		var np = this._getNumOfPages(ingredients, perPage);
		
		for(var i = 1; i <= np; i++) {
			var selectedSet = ingredients.slice((i-1)*perPage, i*perPage);
			this._renderIngPage(selectedSet, i);
		}
		
		$(this.ID_ING).RollingImages.sync();
		$(this.ID_ING).RollingImages.goInit();
	},
	
	_renderIngPage: function(resultSet, pageNum){
		var parent = $(this.ID_ING_SUR);
		var div = document.createElement("div");
		div.className = "point";
		div.id = "ing_" + pageNum;
		parent.appendChild(div);
		
		for(var i = 0; i < resultSet.length; i++){
			var img = document.createElement("img");
			var related_goods = goods[resultSet[i][0]];
			img.src = this.PATH_MERCH + "ingredients/" + resultSet[i][0].trans() + "_big.png";
			img.alt = resultSet[i][0];
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
	
	_createCocktailElement: function(cocktail) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "/cocktails/" + cocktail.name_eng.htmlName() + ".html";
		var img = document.createElement("img");
		img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png";
		var txt = document.createTextNode(cocktail.name);
		a.appendChild(img);
		a.appendChild(txt);
		li.appendChild(a);
		return li;		
	},
	
	expandRelated: function(){ // model
		var recsCol = cssQuery(".column.b-more-rec")[0];
		var relCol  = cssQuery(".column.b-more-cocktails")[0];
		recsCol.style.display = "none";
		relCol.style.width = "62.8em";
	}
}