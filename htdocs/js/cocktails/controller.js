var Controller = {
	ROLLING_IMGS_ID : 'results_display',
	RESULTS_ROOT    : 'surface',
	PAGER_ROOT      : 'p-list',
	ALPHABET_RU     : 'alphabetical-ru',
	LETTERS_ALL     : 'letters_all',
	TAGS_LIST       : 'tags_list',
	STRENGTHS_LIST  : 'strengths_list',
	SELECTED_STYLE  : 'selected-button',
	
	SEARCHES_LIST   : 'ingredients_list',
	SEARCH_EXAMPLE  : 'search_example',
	
	FILTER_COOKIE   : 'filters',
	PAGE_COOKIE     : 'page',
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
		
		var filters = this._filtersFromRequest() || this._filtersFromCookie();
		Model.init(filters);
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
				self.onTagClick(e.target);
			}, false);
		}
		
		var strengthLinks = $(this.STRENGTHS_LIST).getElementsByTagName("a");
		for(var i = 0; i < strengthLinks.length; i++){
			strengthLinks[i].addEventListener('mousedown', function(e){
				self.onStrengthClick(e.target);
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
		this.saveFilters(filters);
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
		
		this._remClass(this.filterElems.tag, this.SELECTED_STYLE);
		if(filters.tag != "") {
			var tagElems = $(this.TAGS_LIST).getElementsByTagName("span");
			for(var i = 0; i < tagElems.length; i++) {
				if(tagElems[i].innerHTML.toLowerCase() == filters.tag) {
					this.filterElems.tag = tagElems[i].parentNode; // a, not span
					this.filterElems.tag.addClassName(this.SELECTED_STYLE);
					break;
				}
			}
		}
		
		this._remClass(this.filterElems.strength, this.SELECTED_STYLE);
		if(filters.strength != "") {
			var strengthElems = $(this.STRENGTHS_LIST).getElementsByTagName("span");
			for(var i = 0; i < strengthElems.length; i++) {
				if(strengthElems[i].innerHTML.toLowerCase() == filters.strength) {
					this.filterElems.strength = strengthElems[i].parentNode; // a, not span
					this.filterElems.strength.addClassName(this.SELECTED_STYLE);
					break;
				}
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
	
	saveFilters: function(filters){
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
		var txt = document.createTextNode(cocktail.name);
		a.appendChild(img);
		a.appendChild(txt);
		li.appendChild(a);
		return li;		
	},
	
	_createIngredientTitle: function(){
		var dt = document.createElement("dt");
		dt.innerHTML = "Коктейли с:";
		return dt;
	},
	
	_createIngredientElement: function(name){
		var dd = document.createElement("dd");
		var a = document.createElement("a");
		a.title = "Убрать из поиска";
		a.innerHTML = "Удалить";
		a.className = "del";
		dd.innerHTML = name;
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