Array.prototype.random = function() {
	var len = this.length
	if (len)
		return this[Math.round(Math.random() * (len - 1))]
}

var Controller = {
	NAME_ELEM  : 'cocktail_name',
	ID_REC     : 'recommendations',
	ID_REC_SUR : 'rec_surface',
	
	ID_ILLUSTRATION : 'illustration',
	
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
	
	PATH_MERCH   : '/i/merchandise/',
	INGRED_POPUP : 'shop-cocktail',
	TOOL_POPUP   : 'shop-gadget',
	
	ID_CART_EMPTY   : 'cart_draghere',
	ID_CART_FULL    : 'cart_contents',
	
	CLASS_VIEW_HOW_BTN : '.bt-view-how',
    KEY_ESC: 27,

	name : "",
	relatedCount: 10,
    currentlyShownIngred: "",
	
	init: function(){
		this.name = $(this.NAME_ELEM).innerHTML;
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
        this.tidyIngredientsList(Model.ingredients);
	},
	
	bindEvents: function(name){
		var self = this;
		var menu = $('panel_cocktail');
		
		var barman = Barman.getByCocktailName(name)
		if (barman) {
			var a = $(this.ID_AUTHOR)
			if (a)
			{
				a.style.display = "inline";
				var ip = new InfoPopup(a, $('barman-info-popup'), Barman.getByCocktailName(name));
				// ip.addCloseListener(function () { a.remClassName('now') });
			}
			
			a = cssQuery(this.SELECTOR_AUTHOR)[0]
			if (a)
			{
				a.addClassName('active')
				var ip = new InfoPopup(a, $('barman-info-popup'), Barman.getByCocktailName(name));
			}
		}
		
		var bars = Bar.getByCocktailName(name)
		if (bars.length)
		{
			var a = $(this.ID_WHERE_TO_TASTE)
			a.style.display = 'inline';
			
			if (bars.length == 1)
			{
				a.href = bars.random().pageHref()
			}
			else
			{
				a.href = '/bars.html#cocktail=' + encodeURIComponent(name)
			}
			
			// course of link.js cancels an event (#451)
			a.addEventListener('click', function (e) { location.href = this.href }, false)
		}
		
		menu.now = menu; 
		this._initNavigationRules(menu);
		
		var mybar_links	= menu.getElementsByTagName('a');
		for (var i = mybar_links.length - 1; i >= 0; i--) {
			mybar_links[i].addEventListener('click', function(e) {
					link.open(this);
					this.parentNode.now.remClassName('now');
					// this.addClassName('now');
					this.parentNode.now = this;
					$(self.ID_ING).RollingImagesLite.goInit(); // Work-around for RI: FIXME
					e.preventDefault();
				}, false);
		}
		link = new Link();
		
		var viewHowBtn = cssQuery(this.CLASS_VIEW_HOW_BTN)[0];
		viewHowBtn.addEventListener('click', function(e){
			link.open("view-how", true);
			$(self.ID_ING).RollingImagesLite.goInit(); // Work-around for RI: FIXME
		}, false);
		
		var tools_links = cssQuery(".b-content .tools dd a");
		for (var i = 0; i < tools_links.length; i++){
			var tool = tools_links[i].innerHTML;
			tools_links[i].addEventListener('click', function(name){ return function(e){	
				$(self.TOOL_POPUP).show();
				self.renderToolPopup(name);
			}}(tool), false);
		}
	
        document.documentElement.addEventListener('keyup', function(e){
            if(e.keyCode == self.KEY_ESC) $(self.TOOL_POPUP).hide();
        }, false);
	
		cssQuery("#shop-gadget .opacity")[0].addEventListener('click', function(e){
		    $(self.TOOL_POPUP).hide();	
		}, false);
		
        $('tool_cancel').addEventListener('mousedown', function(e){
			$(self.TOOL_POPUP).hide();
		}, false);
	
    	$('good_cancel').addEventListener('mousedown', function(e){
			$('order_note').hide();
		}, false);
	    
        $('order_link').addEventListener('mousedown', function(e){
			Calculator.addCocktail(self.name);
			Calculator.showPopup(self.currentlyShownIngred);
		}, false);

    },
	
	setPicture: function(name, good, vol){
		$('good_picture').src = GoodHelper.goodPicSrc(name, good, vol);
	},
	
	renderPopup: function(ingred){
        this.currentlyShownIngred = ingred;
		var good = Model.goods[ingred];
		
		$('good_name').innerHTML = good.brand || ingred;
		if(good.mark){ // branded
			$('good_composition').style.display = "block";
			$('good_mark').innerHTML = good.mark;
            $('good_mark').href = Good.ingredientsLinkByMark(good.mark);
			$('good_ingredient').innerHTML = ingred;
			$('good_ingredient').href = GoodHelper.ingredientLink(ingred);
		} else $('good_composition').style.display = "none";
		
		$('good_desc').innerHTML = good.desc;
		$('good_picture').src = GoodHelper.goodPicSrc(ingred, good); 

		$('good_summ').style.display = "none";
	    $('good_needed').style.display = "none";
	    $('good_accept').style.display = "none";

		var volsNode = $('good_volumes'); 
        volsNode.empty();
		var summ = 0;
		var have = 0;
		var self = this;
		
		for(var i = 0; i < good.volumes.length; i++){
			if(good.volumes[i][2]) {
				var dl         = document.createElement("dl");
				var dt         = document.createElement("dt");
				var a          = document.createElement("a");
				var dd         = document.createElement("dd");
				var strong     = document.createElement("strong");
				
				a.innerHTML = GoodHelper.bottleTxt(ingred, good.unit, good.volumes[i][0]) + GoodHelper.normalVolumeTxt(good.volumes[i][0], good.unit);
				a.addEventListener('mousedown', function(j) { return function(e) {
					self.setPicture(ingred, good, good.volumes[j]);
				}}(i), false);
				
				strong.innerHTML = good.volumes[i][1] + " р.";            	
				dl.appendChild(dt);
				dt.appendChild(a);
				dl.appendChild(dd);
				dd.appendChild(strong);
				volsNode.appendChild(dl);
			}
		}
		if(!Calculator.isIngredientPresent(ingred)) $('order_note').show();
		else $('order_note').hide();
	},
	
	renderToolPopup: function(name){
		var tool = Tool.getByName(name);
		$('tool_name').innerHTML = tool.name;
		$('tool_desc').innerHTML = tool.desc;
		$('tool_picture').src = tool.imgSrc();
	},
	
	_initNavigationRules: function(menu){
		// TODO: remove UI fixes from Controller
		var entry = cssQuery("#cocktail-page .hreview .entry")[0];
		var ul = cssQuery("#cocktail-page #view-how ul")[0];
		var hreview = cssQuery("#cocktail-page .hreview")[0]; 
		var desc = $('view-prepare-text');

		$('view-prepare').show = function()
		{
			$('main-content').style.visibility = 'hidden';
			this.style.display = 'block';
			
			// Apply fix
			if(desc.offsetHeight > 160 && entry.offsetHeight < 240) entry.style.height = (desc.offsetHeight + 20) + "px";
		}
		$('view-prepare').hide = function()
		{
			this.style.display = 'none';
			$('main-content').style.visibility = 'visible';
			
			// Cancel fix
			entry.style.height = "";
		}
		$('view-how').show = function()
		{
			$('main-content').className = 'view-how';
			this.style.display = 'block';
			$('poster').style.visibility = 'hidden';
			
			// Apply fix
			if(ul.offsetHeight > 125) entry.style.height = (ul.offsetHeight + 60) + "px";
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
	
	_createRecommendationElement: function(rec, num){
		var point = document.createElement("a");
		point.className = "point";
		point.id = "rec_"+(num+1);
        point.href = Good.ingredientsLinkByMark(rec.mark);
		var img = document.createElement("img");
		img.src = this.PATH_MERCH + "banners/" + rec.banner;
		img.alt = rec.mark;
		point.appendChild(img);
		return point;	
	},
	
	renderRelated: function (perPage)
	{
		var resultSet = [],
			root = $(this.ID_REL_VPR)
		
		var anchors = root.getElementsByTagName('a')
		
		for (var i = 0; i < anchors.length; i++)
			resultSet[i] = Model.getCocktailByName(anchors[i].firstChild.nodeValue)
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
	
    tidyIngredientsList: function(ingreds) {
        var self   = this;
        var parent = $(this.ID_INGS_LIST);
        var header = parent.getElementsByTagName("dt")[0];
        parent.empty();
        parent.appendChild(header);
        
        var doses = {};
        for(var i = 0; i < ingreds.length; i++){
            doses[ingreds[i][0]] = GoodHelper.normalVolumeTxtParsed(ingreds[i][1]);
        }
        
        for(var i = 0; i < ingreds.length; i++){
            var dd     = document.createElement("dd")
            var a      = document.createElement("a"); 
            var strong = document.createElement("strong"); 
            
            a.innerHTML      = ingreds[i][0];
            strong.innerHTML = doses[ingreds[i][0]];

            dd.appendChild(a);
            dd.appendChild(strong);
            parent.appendChild(dd);
        
			a.addEventListener('click', function(name){ return function(e){
                self.showPopup(name);    	
	   		}}(ingreds[i][0]), false);
		}
    },

    showPopup: function(ingred) {
        if(Calculator.isIngredientPresent(ingred)) 
            Calculator.showPopup(ingred);
        else { 
            $(this.INGRED_POPUP).show(); 
            this.renderPopup(ingred); 
        } 
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
		
		for(var i = 0; i < resultSet.length; i++){
			var img = document.createElement("img");
			img.src = this.PATH_MERCH + "ingredients/" + resultSet[i][0].trans() + ".png";
			img.alt = resultSet[i][0];
            img.addEventListener('click', function(name) { return function(){
                self.showPopup(name);
            }}(resultSet[i][0]), false);
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
		var recsCol = cssQuery(".column.b-more-rec")[0];
		var relCol  = cssQuery(".column.b-more-cocktails")[1];
		recsCol.style.display = "none";
		relCol.style.width = "62.8em";
	}
}
