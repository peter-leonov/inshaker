String.prototype.htmlName = function () {
	return this.toLowerCase().replace(/ /g, "_");
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
}

function toArray(hash) {
	var results = [];
	for(key in hash) results.push(hash[key]);
	return results;
}

function Autocompleter(set, field, div, form, error_div) {
	this.HI_STYLE = 'hi';
	this.ERR_MESSAGE = '...этого у нас еще нет';

	this.KEY_ENTER = 13;
	this.KEY_ESC = 27;
	this.KEY_UP = 38;
	this.KEY_DOWN = 40;
	
	this.hi_pos = -1; // highlight position
	this.selected_elem = null;
	this.listener = null;
	this.shown = false;
	this.initial_input = "";
	
	this.result_set = [];
	div.style.width = (field.offsetWidth-5) + "px;";

	var self = this;
	form.addEventListener('submit', function(e) { e.preventDefault() }, false);
	field.addEventListener('keyup', function(e) {
		switch(e.keyCode){
			case self.KEY_ENTER:
				if(set.indexOf(field.value.capitalize()) > -1) {
					self.hide();
					self.confirm();
				} else if(field.value != ""){
					self.hide();
					self.error();
				}
				break;
			case self.KEY_ESC:	
				self.resetSelection();
				self.hide();
				break;
			case self.KEY_DOWN:
				if(self.shown){
					self.highlight(false);
				}
				break;
			case self.KEY_UP:
				if(self.shown){
					self.highlight(true);
				}
				break;
			default:
				self.initial_input = field.value;
				self.result_set = self.findInSet(field.value);
				if(self.result_set.length > 0) {
					self.clearResults();
					self.resetSelection();
					self.fillResults();
					self.show();
				} else {
					self.clearResults();
					self.resetSelection();
					self.hide();
				}
		}
	}, false);
	
	this.highlight = function(up) {
		var len = div.childNodes.length;
		if(!up) {
			if(this.hi_pos < (len-1)) {
				this._highlightElem(this.hi_pos+1, true);
			} else if(this.hi_pos == (len-1)){
				this._hideSelector(false); // disappear for 1 key press
			} else if(this.hi_pos == len) {
				this._highlightElem(0, true); // round
			}
		} else if(up){
			if(this.hi_pos > 0) {
				this._highlightElem(this.hi_pos-1, true);
			} else if(this.hi_pos == 0) {
				this._hideSelector(true); // disappear for 1 key press
			} else if(this.hi_pos == -1){
				this._highlightElem(len-1, true); // round
			}
		}
	}
	
	this.confirm = function() { 
		this.listener.searchConfirmed(field.value.capitalize()); 
		field.focus();
	}
	
	this.error = function() { error_div.innerHTML = this.ERR_MESSAGE; }
	
	this._hideSelector = function(up) {
		if(this.selected_elem){
			this.selected_elem.remClassName(this.HI_STYLE);
		}
		this.selected_elem = null;
		field.value = this.initial_input;
		if(up) { this.hi_pos--;	} else { this.hi_pos++;	}
	}
	
	this._highlightElem = function(index, put_text) {
		if(this.selected_elem)	this.selected_elem.remClassName(this.HI_STYLE);
		if(typeof(index) == "number") {
			this.hi_pos = index;
		} else if (typeof(index) == "object"){
			this.hi_pos = this._getIndex(div, index);
		}
		this.selected_elem = div.childNodes[this.hi_pos];
		this.selected_elem.addClassName(this.HI_STYLE);
		if(put_text) field.value = this.selected_elem.innerHTML;
	}
	
	this._unhighlightElem = function(elem) {
		elem.remClassName(this.HI_STYLE);
	}
	
	this._getIndex = function(parent, elem) {
		var children = parent.childNodes;
		var len = children.length;
		for(var i=0; i < len; i++) { 
			if(children[i] == elem) return i;
		}
		return -1;
	}
	
	this.resetSelection = function() {
		this.hi_pos = -1;
		this.selected_elem = null;
		this.initial_inpit = "";
	}
	
	this.findInSet = function(name) {
		var res = [];
		var reg = new RegExp("(^" + name + ".*|.+\ " + name + ".*(\ |$))", "i");
		
		for(var i = 0; i < set.length; i++){
			if(set[i].match(reg) && name != "") {
				res.push(set[i]);
			}
		}
		return res;
	}
	
	this.clearResults = function() { error_div.innerHTML = div.innerHTML = ""; }
	
	this.fillResults = function() {
		for(var i = 0; i < this.result_set.length; i++) {
			var item = document.createElement("div");
			var txt = document.createTextNode(this.result_set[i]);
			item.appendChild(txt);
			div.appendChild(item);
			var self = this;
			item.addEventListener('click', function(e) {
				self._highlightElem(e.target, true);
				self.hide();
				self.confirm();
			}, false);
			item.addEventListener('mouseover', function(e){
				self._highlightElem(e.target);
			}, false);
			item.addEventListener('mouseout', function(e){
				self._unhighlightElem(e.target);
			}, false);
		}
	}
	
	this.show = function() { div.style.display = "block"; this.shown = true;  }
	this.hide = function() { div.style.display = "none";  this.shown = false; }
}

var Controller = {
	ROLLING_IMGS_ID: 'results_display',
	RESULTS_ROOT:    'surface',
	PAGER_ROOT:      'p-list',
	ALPHABET_RU:     'alphabetical-ru',
	LETTERS_ALL:     'letters_all',
	TAGS_LIST:       'tags_list',
	STRENGTHS_LIST:  'strengths_list',
	SELECTED_STYLE:  'selected-button',
	
	SEARCHES_LIST:   'searches_list',
	SEARCH_INPUT:    'search_input',
	SEARCH_FORM:     'search_form',
	SEARCH_ERROR:    'search_error',
	AUTOCOMPLETE:    'autocomplete', 
	
	filter_letter: "",
	filter_tag: "",
	filter_strength: "",
	
	filter_letter_elem: null,
	filter_tag_elem: null,
	filter_strength_elem: null,
	
	per_page: 16,
	result_set: [],
	cocktails_set: [],
	autocompleter: null,
	
	init: function() {
		var sortfunc = function(a, b){
			if(a.name > b.name) return 1;
			else if(a.name == b.name) return 0;
			else return -1;
		}
		this.result_set = this.cocktails_set = toArray(cocktails).sort(sortfunc);
		this.filter_letter_elem = $(this.LETTERS_ALL);
		this.renderAllPages();
		this.renderSet($(this.TAGS_LIST), tags);
		this.renderSet($(this.STRENGTHS_LIST), strengths); 
		$(this.ROLLING_IMGS_ID).RollingImages.goInit();
		this.bindEvents();
		this.autocompleter = new Autocompleter(ingredients, $(this.SEARCH_INPUT), 
							$(this.AUTOCOMPLETE), $(this.SEARCH_FORM), $(this.SEARCH_ERROR));
		this.autocompleter.listener = this;
	},
	
	bindEvents: function() {
		var letter_links = $(this.ALPHABET_RU).getElementsByTagName("a");
		for(var i = 0; i < letter_links.length; i++){
			var self = this;
			letter_links[i].addEventListener('click', function(e){
				self.onLetterFilter(e.target);
			}, false);
		}
		
		var tag_links = $(this.TAGS_LIST).getElementsByTagName("a");
		for(var i = 0; i < tag_links.length; i++){
			var self = this;
			tag_links[i].addEventListener('click', function(e){
				self.onTagFilter(e.target);
			}, false);
		}
		
		var strength_links = $(this.STRENGTHS_LIST).getElementsByTagName("a");
		for(var i = 0; i < strength_links.length; i++){
			var self = this;
			strength_links[i].addEventListener('click', function(e){
				self.onStrengthFilter(e.target);
			}, false);
		}
	},
	
	onLetterFilter: function(target_elem) {
		this._resetTagFilter();
		this._resetStrengthFilter();
		
		var letter = target_elem.innerHTML.toUpperCase();
		if(this.filter_letter != letter) {
			this.filter_letter_elem.remClassName(this.SELECTED_STYLE);
			target_elem.addClassName(this.SELECTED_STYLE);
			this.filter_letter = letter;
			this.filter_letter_elem = target_elem;
			if(target_elem.id == this.LETTERS_ALL){
				this.result_set = this.cocktails_set;
			} else {
				this.result_set = this._filterByLetter(this.cocktails_set, letter);
			}
			this.renderAllPages();
		}
	},
	
	onTagFilter: function(target_elem) {
		this._resetLetterFilter();
		
		var tag = target_elem.innerHTML.toLowerCase();
		if(this.filter_tag != tag) {
			if(this.filter_tag_elem){
				this.filter_tag_elem.remClassName(this.SELECTED_STYLE);
			}
			target_elem.parentNode.addClassName(this.SELECTED_STYLE);
			this.filter_tag = tag;
			this.filter_tag_elem = target_elem.parentNode; // a, not span
			
			this.result_set = this._filterByTag(this.cocktails_set, this.filter_tag);
			if(this.filter_strength.length > 0) {
				this.result_set = this._filterByStrength(this.result_set, this.filter_strength);
			}
		} else { // cancelling filter
			this._resetTagFilter();
			if(this.filter_strength.length > 0) {
				this.result_set = this._filterByStrength(this.cocktails_set, this.filter_strength);
			} else {
				this.result_set = this.cocktails_set;
			}
		}
		this.renderAllPages();
	},
	
	onStrengthFilter: function(target_elem){
		this._resetLetterFilter();
		
		var strength = target_elem.innerHTML.toLowerCase();		
		if(this.filter_strength != strength) {
			if(this.filter_strength_elem) {
				this.filter_strength_elem.remClassName(this.SELECTED_STYLE);
			}
			target_elem.parentNode.addClassName(this.SELECTED_STYLE);
			this.filter_strength = strength;
			this.filter_strength_elem = target_elem.parentNode; // a, not span
			
			this.result_set = this._filterByStrength(this.cocktails_set, this.filter_strength);
			if(this.filter_tag.length > 0) {
				this.result_set = this._filterByTag(this.result_set, this.filter_tag);
			}
		} else { // cancelling
			this._resetStrengthFilter();
			if(this.filter_tag.length > 0 ) {
				this.result_set = this._filterByTag(this.cocktails_set, this.filter_tag);
			} else {
				this.result_set = this.cocktails_set;
			}
		}
		this.renderAllPages();
	},
	
	onIngredientFilter: function(name){
		alert(name);
	},
	
	searchConfirmed: function(name){
		this.onIngredientFilter(name);
	},
	
	_resetLetterFilter: function() {
		this.filter_letter = "";
		if(this.filter_letter_elem) {
			this.filter_letter_elem.remClassName(this.SELECTED_STYLE);
		}
		this.filter_letter_elem = $(this.LETTERS_ALL);
		this.filter_letter_elem.addClassName(this.SELECTED_STYLE);
	},
	
	_resetTagFilter: function() {
		this.filter_tag = "";
		if(this.filter_tag_elem){
			this.filter_tag_elem.remClassName(this.SELECTED_STYLE);
		}
		this.filter_tag_elem = null;
	},
		
	_resetStrengthFilter: function() {
		this.filter_strength = "";
		if(this.filter_strength_elem) {
			this.filter_strength_elem.remClassName(this.SELECTED_STYLE);
		}
		this.filter_strength_elem = null;
	},
	
	renderAllPages: function(){
		$(this.RESULTS_ROOT).innerHTML=""; // clean up
		var np = this._getNumOfPages();
		for(var i = 1; i <= np; i++) {
			this._renderPage(i);
		}
		this._renderPager();
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
	
	_renderPage: function (page_num) {
		var selected = this.result_set.slice((page_num - 1) * this.per_page,
		 									  page_num * this.per_page);
		var parent = $(this.RESULTS_ROOT);
		var page = document.createElement("div");
		page.id = "page_" + page_num;
		page.className = "point";
		parent.appendChild(page);
		
		var ul = document.createElement("ul");
		ul.id = "ul_" + page_num;
		ul.className = "cocktails";
		page.appendChild(ul);
		
		for (var i = 0; i < selected.length; i++) {
			ul.appendChild(this._createCocktailElement(selected[i]));
		}
	},
	
	_createCocktailElement: function(cocktail) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "cocktails/" + cocktail.name_eng.htmlName() + ".html";
		var img = document.createElement("img");
		img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png";
		var txt = document.createTextNode(cocktail.name);
		a.appendChild(img);
		a.appendChild(txt);
		li.appendChild(a);
		return li;		
	},
	
	_getNumOfPages: function() {
		return parseInt(this.result_set.length / this.per_page) + 1;
	},
	
	_renderPager: function () {
		var span = $(this.PAGER_ROOT);
		span.innerHTML=""; // clean up
		var num_of_pages = this._getNumOfPages();
		var pointer = 1;
		while(pointer <= num_of_pages){
			var a = document.createElement("a");
			a.className="button";
			a.appendChild(document.createTextNode(pointer));
			span.appendChild(a);
			pointer++;
		}
	},
	
	_filterByLetter: function (set, letter){
		var res = [];	
		var reg = new RegExp("^(" + letter.toUpperCase() + ")");
		for(var i = 0; i < set.length; i++) {
			if(set[i].name.match(reg)){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	_filterByTag: function (set, tag) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].tags.indexOf(tag) > -1){
				res.push(set[i]);
			}
		}
		return res;
	},
	
	_filterByStrength: function(set, strength) {
		var res = [];
		for(var i = 0; i < set.length; i++){
			if(set[i].strength == strength) {
				res.push(set[i]);
			}
		}
		return res;
	}
};