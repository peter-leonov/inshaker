function CocktailsView (nodes, styles) {
	nodes.preloader.hide();
	document.documentElement.style.overflowY="auto";
	new Programica.RollingImagesLite(nodes.resultsDisplay);
	
	this.filterElems   = { tag: null, strength: null, letter: null };
	this.perPage       = 16;
	this.autocompleter = null;	
	this.riJustInited  = true;
	this.dropTargets = [nodes.cartEmpty, nodes.cartFull];
	
	this.initialize = function (tags, strengths, cocktailsLetters, ingredients, randomIngredient){
		this.autocompleter = new Autocompleter(ingredients);
		this.autocompleter.changeListener = this;
	
        this.renderLetters(nodes.alphabetRu, cocktailsLetters);
		this.renderSet(nodes.tagsList, tags);
		this.renderSet(nodes.strengthsList, strengths);

		nodes.searchExample.innerHTML = randomIngredient;
		this.bindEvents();
	};
	
	this.bindEvents = function () {	
		var self = this;
		var letterLinks = nodes.alphabetRu.getElementsByTagName("a");
		for(var i = 0; i < letterLinks.length; i++){
			letterLinks[i].addEventListener('mousedown', function(e){
				self.controller.onLetterFilter(e.target.innerHTML.toUpperCase(), nodes.lettersAll.innerHTML.toUpperCase());
			}, false);
		}
		
		var tagLinks = nodes.tagsList.getElementsByTagName("a");
		for(var i = 0; i < tagLinks.length; i++){
			tagLinks[i].addEventListener('mousedown', function(e){
                if(e.target.getAttribute('disabled')+"" != 'true') {
                    self.controller.onTagFilter(e.target.innerHTML.toLowerCase());
                }
			}, false);
		}
		
		var strengthLinks = nodes.strengthsList.getElementsByTagName("a");
		for(var i = 0; i < strengthLinks.length; i++){
			strengthLinks[i].addEventListener('mousedown', function(e){
				if(e.target.getAttribute('disabled')+"" != 'true') {
                    self.controller.onStrengthFilter(e.target.innerHTML.toLowerCase());
                }
			}, false);
		}
		
		nodes.resultsDisplay.RollingImagesLite.onselect = function(node, num){
			if   (!self.riJustInited) self.controller.onPageChanged(num);
			else { self.riJustInited = false; }
		}
		
		nodes.searchExample.addEventListener('mousedown', function(e){
			self.autocompleter.force(nodes.searchExample.innerHTML);
		}, false);
		link = new Link();
	};

	this.onIngredientAdded = function(name) {
		this.controller.onIngredientFilter(name, false);
	};
	
	this.onIngredientRemoved = function(name) {
		this.controller.onIngredientFilter(name, true);
	};
	
	this.onSearchConfirmed =  function(name){ // autocompleter
		this.onIngredientAdded(name);
		this.autocompleter.emptyField();
	};
	
	this.onModelChanged = function(resultSet, filters, tagState, strengthState) { // model
		this.renderAllPages(resultSet);
		this.renderFilters(filters, tagState, strengthState);
		this.controller.saveState(filters, tagState, strengthState);
	};
	
	
	this.renderFilters = function(filters, tagState, strengthState){
		remClass(this.filterElems.letter || nodes.lettersAll, styles.selected);
		if(filters.letter != "") {
			var letterElems = nodes.alphabetRu.getElementsByTagName("a");
			for(var i = 0; i < letterElems.length; i++) {
				if(letterElems[i].innerHTML == filters.letter.toLowerCase()){
					this.filterElems.letter = letterElems[i];
					break;
				}
			}   
		} else this.filterElems.letter = nodes.lettersAll;
		this.filterElems.letter.addClassName(styles.selected);
		
		var tagElems = nodes.tagsList.getElementsByTagName("span");
		for(var i = 0; i < tagElems.length; i++) {
			var elemTxt = tagElems[i].innerHTML.toLowerCase();
			if(elemTxt == filters.tag) {
				this.filterElems.tag = tagElems[i].parentNode; // a, not span
				this.filterElems.tag.className = styles.selected;
                tagElems[i].setAttribute("disabled", false);
			} else if(tagState.indexOf(elemTxt) == -1) {
				tagElems[i].parentNode.className = styles.disabled;
                tagElems[i].setAttribute("disabled", true);
			} else {
				tagElems[i].parentNode.className = "";
                tagElems[i].setAttribute("disabled", false);
			}
		}
		
		var strengthElems = nodes.strengthsList.getElementsByTagName("span");
		for(var i = 0; i < strengthElems.length; i++) {
			var elemTxt = strengthElems[i].innerHTML.toLowerCase();
			if(elemTxt == filters.strength) {
				this.filterElems.strength = strengthElems[i].parentNode; // a, not span
				this.filterElems.strength.className = styles.selected;
                strengthElems[i].setAttribute('disabled', false);
            } else if(strengthState.indexOf(elemTxt) == -1) {
			    strengthElems[i].parentNode.className = styles.disabled
            	strengthElems[i].setAttribute('disabled', true);
			} else {
				strengthElems[i].parentNode.className = "";
                strengthElems[i].setAttribute('disabled', false);
			}
		}
		
		var ingredientsParent = nodes.searchesList;
		ingredientsParent.innerHTML = "";
		if(filters.ingredients.length > 0) {
			var ingreds = filters.ingredients;
			ingredientsParent.appendChild(this.createIngredientTitle());
			for(var i = 0; i < ingreds.length; i++) {
				ingredientsParent.appendChild(this.createIngredientElement(ingreds[i]));
			}
		}
		
		if(filters.page > 0) {
			nodes.resultsDisplay.RollingImagesLite.goToFrame(filters.page, 'directJump');	
		}
	},
	
	this.renderAllPages = function(resultSet){
		var np = this.getNumOfPages(resultSet, this.perPage);
		
		nodes.resultsRoot.innerHTML=""; // clean up
		for(var i = 1; i <= np; i++) {
			var selectedSet = resultSet.slice((i-1)*this.perPage, i*this.perPage);
			this.renderPage(selectedSet, i);
		}
		this.renderPager(np);
		nodes.resultsDisplay.RollingImagesLite.sync();
		nodes.resultsDisplay.RollingImagesLite.goInit();
	};

	this.renderSet = function(parent, set){
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
	};
	
	this.renderLetters = function(parent, set){
		for(var i = 0; i < set.length; i++){
			var a = document.createElement("a");
			a.innerHTML = set[i];
			parent.appendChild(a);
		}
	},
	
	this.renderPage = function (selectedSet, pageNum) {
		var parent = nodes.resultsRoot;
		var page = document.createElement("div");
		page.id = "page_" + pageNum;
		page.className = "point";
		parent.appendChild(page);
		
		var ul = document.createElement("ul");
		ul.id = "ul_" + pageNum;
		ul.className = "cocktails";
		page.appendChild(ul);
		for (var i = 0; i < selectedSet.length; i++) {
			ul.appendChild(this.createCocktailElement(selectedSet[i]));
		}
	};
	
	this.createCocktailElement = function(cocktail) {
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "/cocktails/" + cocktail.name_eng.htmlName() + ".html";
		var img = document.createElement("img");
		img.className = "mini-illustration";
		img.src = "/i/cocktail/s/" + cocktail.name_eng.htmlName() + ".png";
		new Draggable(img, cocktail.name, this.dropTargets);
		var txt = document.createTextNode(cocktail.name);
		a.appendChild(img);
		a.appendChild(txt);
		li.appendChild(a);
		return li;		
	};
	
	this.createIngredientTitle = function(){
		var dt = document.createElement("dt");
		return dt;
	};
	
	this.createIngredientElement = function(name){
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
	};
	
	this.getNumOfPages = function(resultSet, perPage) {
		if ((resultSet.length % perPage) == 0) return (resultSet.length/perPage);
		return parseInt(resultSet.length / perPage) + 1;
	};
	
	this.renderPager = function (numOfPages) {
		var span = nodes.pagerRoot;
		span.innerHTML=""; // clean up
		var pointer = 1;
		while(pointer <= numOfPages){
			var a = document.createElement("a");
			a.className="button";
			a.appendChild(document.createTextNode(pointer));
			span.appendChild(a);
			pointer++;
		}
	};
}