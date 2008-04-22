var Controller = {
	ROLLING_IMGS_ID : 'results_display',
	RESULTS_ROOT    : 'surface',
	PAGER_ROOT      : 'p-list',
	ALPHABET_RU     : 'alphabetical-ru',
	LETTERS_ALL     : 'letters_all',
	TAGS_LIST       : 'tags_list',
	STRENGTHS_LIST  : 'strengths_list',
	SELECTED_STYLE  : 'selected-button',
	DISABLED_STYLE  : 'dis',
	
	SEARCHES_LIST   : 'ingredients_list',
	SEARCH_EXAMPLE  : 'search_example',
	
	FILTER_COOKIE   : 'filters',

    STRENGTH_STATE_COOKIE : 'strength_state',
    TAG_STATE_COOKIE      : 'tag_state',

	DROP_TARGET   : 'cart_draghere',
	
    filterElems     : { tag: null, strength: null, letter: null },
	
	perPage         : 16,
	autocompleter   : null,
	
	riJustInited    : true,
    
	init: function() {
		this.autocompleter = new Autocompleter(Model.ingredients);

        this.renderLetters($(this.ALPHABET_RU), Model.cocktailsLetters());
		this.renderSet($(this.TAGS_LIST), 	    Model.tags);
		this.renderSet($(this.STRENGTHS_LIST),  Model.strengths); 
		
        this.bindEvents();
		$(this.SEARCH_EXAMPLE).innerHTML = Model.randomIngredient();
		
		var filters = this._filtersFromRequest();
        var states = null;
        if(!filters) {
            filters = this._filtersFromCookie();
            states = this._statesFromCookies();
        }
        Model.init(filters, states);
 	},
	
	_filtersFromRequest: function(){
		var address = window.location.href;
		var match = address.match(/.+\?(.+)/);
		if(match){
			var params = match[1].split("&");
			var filters = {};
			for(var i = 0; i < params.length; i++) {
				var pair = params[i].split("=");
				filters[pair[0]]=decodeURIComponent(pair[1]);
			}
			return filters;
		} else return null;
	},
	
    _statesFromCookies: function(){
        var res = [];
        var ss = Cookie.get(this.STRENGTH_STATE_COOKIE);
        if(ss) res[0] = JSON.parse(ss);
        var ts = Cookie.get(this.TAG_STATE_COOKIE);
        if(ts) res[1] = JSON.parse(ts);
        return res;
    },

	_filtersFromCookie: function(){
		var cookie = Cookie.get(this.FILTER_COOKIE);
		if(cookie) return JSON.parse(cookie);
		else return null;
	},
	
	bindEvents: function() {
		Model.dataListener = this;
		this.autocompleter.changeListener = this;
		var self = this;
		
		var letterLinks = $(this.ALPHABET_RU).getElementsByTagName("a");
		for(var i = 0; i < letterLinks.length; i++){
			letterLinks[i].addEventListener('mousedown', function(e){
				self.onLetterClick(e.target);
			}, false);
		}
		
		var tagLinks = $(this.TAGS_LIST).getElementsByTagName("a");
		for(var i = 0; i < tagLinks.length; i++){
			tagLinks[i].addEventListener('mousedown', function(e){
                if(e.target.getAttribute('disabled') != 'true') {
                    self.onTagClick(e.target);
                }
			}, false);
		}
		
		var strengthLinks = $(this.STRENGTHS_LIST).getElementsByTagName("a");
		for(var i = 0; i < strengthLinks.length; i++){
			strengthLinks[i].addEventListener('mousedown', function(e){
				if(e.target.getAttribute('disabled') != 'true') {
                    self.onStrengthClick(e.target);
                }
			}, false);
		}
		
		$(this.ROLLING_IMGS_ID).RollingImages.onselect = function(node, num){
			if   (!self.riJustInited) self.onPageChanged(num);
			else { self.riJustInited = false; }
		}
		link = new Link();
		
		$(this.SEARCH_EXAMPLE).addEventListener('mousedown', function(e){
			self.autocompleter.force($(self.SEARCH_EXAMPLE).innerHTML);
		}, false);
	},
	
	onPageChanged: function(num){
		Model.onPageChanged(num);
	},
	
	onLetterClick: function(targetElem) {		
		Model.onLetterFilter(targetElem.innerHTML.toUpperCase(), 
					 $(this.LETTERS_ALL).innerHTML.toUpperCase());
	},
	
	onTagClick: function(targetElem) {
		Model.onTagFilter(targetElem.innerHTML.toLowerCase());
	},
	
	onStrengthClick: function(targetElem){
		Model.onStrengthFilter(targetElem.innerHTML.toLowerCase());
	},

	onIngredientAdded: function(name){
		Model.onIngredientFilter(name, false);
	},
	
	onIngredientRemoved: function(name) {
		Model.onIngredientFilter(name, true);
	},
	
	onSearchConfirmed: function(name){ // autocompleter
		this.onIngredientAdded(name);
		this.autocompleter.emptyField();
	},
	
	onModelChanged: function(resultSet, filters) { // model
		this.renderAllPages(resultSet);
		this.renderFilters(filters);
		this.saveState(filters);
	},
	
	_remClass: function(elem, className) { if(elem) elem.remClassName(className); },
	
	renderFilters: function(filters){
		this._remClass(this.filterElems.letter || $(this.LETTERS_ALL), this.SELECTED_STYLE);
		if(filters.letter != "") {
			var letterElems = $(this.ALPHABET_RU).getElementsByTagName("a");
			for(var i = 0; i < letterElems.length; i++) {
				if(letterElems[i].innerHTML == filters.letter.toLowerCase()){
					this.filterElems.letter = letterElems[i];
					break;
				}
			}   
		} else this.filterElems.letter = $(this.LETTERS_ALL);
		this.filterElems.letter.addClassName(this.SELECTED_STYLE);
		
		var tagElems = $(this.TAGS_LIST).getElementsByTagName("span");
		for(var i = 0; i < tagElems.length; i++) {
			var elemTxt = tagElems[i].innerHTML.toLowerCase();
			if(elemTxt == filters.tag) {
				this.filterElems.tag = tagElems[i].parentNode; // a, not span
				this.filterElems.tag.className = this.SELECTED_STYLE;
                tagElems[i].setAttribute("disabled", false);
			} else if(Model.tagState.indexOf(elemTxt) == -1) {
				tagElems[i].parentNode.className = this.DISABLED_STYLE;
                tagElems[i].setAttribute("disabled", true);
			} else {
				tagElems[i].parentNode.className = "";
                tagElems[i].setAttribute("disabled", false);
			}
		}
		
		var strengthElems = $(this.STRENGTHS_LIST).getElementsByTagName("span");
		for(var i = 0; i < strengthElems.length; i++) {
			var elemTxt = strengthElems[i].innerHTML.toLowerCase();
			if(elemTxt == filters.strength) {
				this.filterElems.strength = strengthElems[i].parentNode; // a, not span
				this.filterElems.strength.className = this.SELECTED_STYLE;
                strengthElems[i].setAttribute('disabled', false);
            } else if(Model.strengthState.indexOf(elemTxt) == -1) {
			    strengthElems[i].parentNode.className = this.DISABLED_STYLE;
            	strengthElems[i].setAttribute('disabled', true);
			} else {
				strengthElems[i].parentNode.className = "";
                strengthElems[i].setAttribute('disabled', false);
			}
		}
		
		var ingredientsParent = $(this.SEARCHES_LIST);
		ingredientsParent.innerHTML = "";
		if(filters.ingredients.length > 0) {
			var ingreds = filters.ingredients;
			ingredientsParent.appendChild(this._createIngredientTitle());
			for(var i = 0; i < ingreds.length; i++) {
				ingredientsParent.appendChild(this._createIngredientElement(ingreds[i]));
			}
		}
		
		if(filters.page > 0) {
			$(this.ROLLING_IMGS_ID).RollingImages.goToFrame(filters.page, 'directJump');	
		}
	},
	
	saveState: function(filters){
		Cookie.set(this.TAG_STATE_COOKIE, JSON.stringify(Model.tagState));
        Cookie.set(this.STRENGTH_STATE_COOKIE, JSON.stringify(Model.strengthState));
        Cookie.set(this.FILTER_COOKIE, JSON.stringify(filters));
	},
	
	renderAllPages: function(resultSet){
		$(this.RESULTS_ROOT).innerHTML=""; // clean up
		var np = this._getNumOfPages(resultSet, this.perPage);
		for(var i = 1; i <= np; i++) {
			var selectedSet = resultSet.slice((i-1)*this.perPage, i*this.perPage);
			this._renderPage(selectedSet, i);
		}
		this._renderPager(np);
		
		$(this.ROLLING_IMGS_ID).RollingImages.sync();
		$(this.ROLLING_IMGS_ID).RollingImages.goInit();
	},

	renderSet: function(parent, set){
		for(var i = 0; i < set.length; i++) {
			var dd = document.createElement("dd");
			var a = document.createElement("a");
			var span = document.createElement("span");
			var txt = document.createTextNode(set[i].capitalize());
			span.appendChild(txt);
			a.appendChild(span);
			dd.appendChild(a);
			parent.appendChild(dd);
		}		
	},
	
	renderLetters: function(parent, set){
		for(var i = 0; i < set.length; i++){
			var a = document.createElement("a");
			a.innerHTML = set[i];
			parent.appendChild(a);
		}
	},
	
	_renderPage: function (selectedSet, pageNum) {
		var parent = $(this.RESULTS_ROOT);
		var page = document.createElement("div");
		page.id = "page_" + pageNum;
		page.className = "point";
		parent.appendChild(page);
		
		var ul = document.createElement("ul");
		ul.id = "ul_" + pageNum;
		ul.className = "cocktails";
		page.appendChild(ul);
		
		for (var i = 0; i < selectedSet.length; i++) {
			ul.appendChild(this._createCocktailElement(selectedSet[i]));
		}
	},
	
	_createCocktailElement: function(cocktail) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "/cocktails/" + cocktail.name_eng.htmlName() + ".html";
		var img = document.createElement("img");
		img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png";
		new Draggable(img, cocktail.name, $(this.DROP_TARGET));
		var txt = document.createTextNode(cocktail.name);
		a.appendChild(img);
		a.appendChild(txt);
		li.appendChild(a);
		return li;		
	},
	
	_createIngredientTitle: function(){
		var dt = document.createElement("dt");
		return dt;
	},
	
	_createIngredientElement: function(name){
		name = GoodHelper.shortName(name);
		var dd = document.createElement("dd");
		var span = document.createElement("span");
		var a = document.createElement("a");
		a.title = "Убрать из поиска";
		a.innerHTML = "Удалить";
		a.className = "rem";
		span.innerHTML = name;
		dd.appendChild(span);
		dd.appendChild(a);
		var self = this;
		dd.addEventListener('mousedown', function(e){
			self.onIngredientRemoved(name);
		}, false);
		return dd;	
	},
	
	_getNumOfPages: function(resultSet, perPage) {
		if ((resultSet.length % perPage) == 0) return (resultSet.length/perPage);
		return parseInt(resultSet.length / perPage) + 1;
	},
	
	_renderPager: function (numOfPages) {
		var span = $(this.PAGER_ROOT);
		span.innerHTML=""; // clean up
		var pointer = 1;
		while(pointer <= numOfPages){
			var a = document.createElement("a");
			a.className="button";
			a.appendChild(document.createTextNode(pointer));
			span.appendChild(a);
			pointer++;
		}
	},	
};
