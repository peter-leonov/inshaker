function CocktailsView (states, nodes, styles) {
	nodes.preloader.hide();
	document.documentElement.style.overflowY="auto";
	new Programica.RollingImagesLite(nodes.resultsDisplay, {animationType: 'easeInOutQuad', duration:0.75});
	
	this.filterElems   = { tag: null, strength: null, letter: null };
	this.perPage       = 16;
	this.np            = -1;
  this.renderedPages = [];
  this.nodeCache     = {};


  this.riJustInited  = true;
	this.dropTargets   = [nodes.cartEmpty, nodes.cartFull];
	this.IE6 = Programica.userAgentRegExps.MSIE6.test(navigator.userAgent);

	this.currentState;
	this.stateSwitcher;
  this.resultSet; // for caching purposes only
	
	this.initialize = function (tags, strengths, cocktailsLetters, ingredsNames, state){
		this.iAutocompleter = new Autocompleter(ingredsNames, 
								nodes.searchByIngreds.getElementsByTagName("input")[0],
								nodes.searchByIngreds.getElementsByTagName("form")[0]);
								
    this.renderLetters(nodes.alphabetRu, cocktailsLetters);
		this.renderSet(nodes.tagsList, tags);
		this.renderSet(nodes.strengthsList, strengths);
		this.bindEvents();
    this.turnToState(state);
	};
	
	this.bindEvents = function () {
		var self = this;
    
    var letterLinks = cssQuery("a", nodes.alphabetRu).concat(nodes.lettersAll);
		for(var i = 0; i < letterLinks.length; i++){
      letterLinks[i].addEventListener('mousedown', function(e){
				self.controller.onLetterFilter(e.target.innerHTML.toUpperCase(), 
											nodes.lettersAll.innerHTML.toUpperCase());
			}, false);
		}

		var tagLinks = cssQuery("dd", nodes.tagsList);
		for(var i = 0; i < tagLinks.length; i++){
			tagLinks[i].addEventListener('mousedown', function(num){ return function(){
          if(!tagLinks[num].hasClassName(styles.disabled)) {
              self.controller.onTagFilter(cssQuery("span", this)[0].innerHTML.toLowerCase());
          }
			}}(i), false);
		}

		var strengthLinks = cssQuery("dd", nodes.strengthsList);
		for(var i = 0; i < strengthLinks.length; i++){
			strengthLinks[i].addEventListener('mousedown', function(num){ return function(){
				if(!strengthLinks[num].hasClassName(styles.disabled)) {
            self.controller.onStrengthFilter(cssQuery("span",this)[0].innerHTML.toLowerCase());
        }
			}}(i), false);
		}
    
    var ril = nodes.resultsDisplay.RollingImagesLite;

    nodes.bigPrev.addEventListener('mousedown', function(e){ ril.goPrev() }, false);
    nodes.bigNext.addEventListener('mousedown', function(e){ ril.goNext() }, false);
		
    ril.onselect = function (node, num) {
      if (!self.riJustInited) {
        self.controller.onPageChanged(num);
        self.renderNearbyPages(num);
			} else { self.riJustInited = false }
      
      // big pager buttons
      if(num == (self.np-1) || self.np == 1) nodes.bigNext.addClassName(styles.disabled);
      else nodes.bigNext.remClassName(styles.disabled);
      if(num == 0 || self.np == 1) nodes.bigPrev.addClassName(styles.disabled);
      else nodes.bigPrev.remClassName(styles.disabled);
		}

		nodes.searchExampleIngredient.addEventListener('mousedown', function(e){ self.iAutocompleter.force(this.innerHTML) }, false);

		nodes.searchByName.getElementsByTagName("form")[0].addEventListener('submit', function(e) { e.preventDefault() }, false);
		var searchByNameInput = nodes.searchByName.getElementsByTagName("input")[0];
		searchByNameInput.addEventListener('keyup', function(e){ self.controller.onNameFilter(this.value) }, false);

		nodes.searchTipName.show = function () {
			this.style.display = "block";
			this.style.visibility = "visible";
			var names = self.controller.needRandomCocktailNames();
			nodes.searchExampleName.innerHTML = names[0];
			nodes.searchExampleNameEng.innerHTML = names[1];
		};
    
    nodes.removeAllIngreds.addEventListener('click', function(e){
				self.onAllIngredientsRemoved();
			}, false);

    nodes.searchTipIngredient.show = function () {
			this.style.display = "block";
			this.style.visibility = "visible";
			nodes.searchExampleIngredient.innerHTML = self.controller.needRandomIngredient();
		};

    nodes.ingredsView.show = function(){
      this.style.display = "block";
      this.style.visibility = "visible";
      nodes.searchTips.hide();
    }

    nodes.ingredsView.hide = function(){
      this.style.visibility = "hidden";
      this.style.display = "none";
      nodes.searchTips.show();
    }

		var nameSearchHandler = function (e) {
			searchByNameInput.value = this.innerHTML;
			self.controller.onNameFilter(this.innerHTML);
			nodes.searchTipName.hide();
		};

		nodes.searchExampleName.addEventListener('mousedown', nameSearchHandler, false);
		nodes.searchExampleNameEng.addEventListener('mousedown', nameSearchHandler, false);

		this.stateSwitcher = Switcher.bind(nodes.searchTabs, nodes.searchTabs.getElementsByTagName("li"),
						[nodes.searchByName, nodes.searchByLetter, nodes.searchByIngreds]);

		this.stateSwitcher.onselect = function (num) {
      self.turnToState(num);
			self.controller.onStateChanged(num);
		}

		this.iAutocompleter.changeListener = {
			onSearchConfirmed: function (name) {
				self.onIngredientAdded(name);
				self.iAutocompleter.emptyField();
		}};

		link = new Link();
	};
	
	this.turnToState = function(state){
    this.currentState = state;
    this.stateSwitcher.drawSelected(state);

		var expand = (state == states.byName || state == states.byLetter);
		var viewport = nodes.mainArea.getElementsByClassName("viewport")[0]; 
		
		if(expand) {
      nodes.mainArea.style.marginLeft = 0;
			nodes.tagStrengthArea.hide();
      viewport.addClassName(styles.expanded);
			this.perPage = 20;
		} else {
			nodes.mainArea.style.marginLeft = "16em";
			nodes.tagStrengthArea.show();
			viewport.remClassName(styles.expanded);
			this.perPage = 16;
		}
    
    if(this.IE6) nodes.resultsDisplay.style.width = viewport.offsetWidth + "px"
		
		nodes.ingredsView.hide();
    nodes.searchTipIngredient.setVisible(state == states.byIngredients);
		nodes.searchTipName.setVisible(state == states.byName);
    if(state != states.byName) cssQuery("input", nodes.searchByName)[0].value = "";
	};
	
	this.onAllIngredientsRemoved = function () {
		this.controller.onIngredientFilter();
	};

	this.onIngredientAdded = function(name) {
		this.controller.onIngredientFilter(name, false);
	};
	
	this.onIngredientRemoved = function(name) {
		this.controller.onIngredientFilter(name, true);
	};
	
	this.onModelChanged = function(resultSet, filters, tagState, strengthState) { // model
		this.renderAllPages(resultSet, filters.page);
		this.renderFilters(filters, tagState, strengthState);
		this.controller.saveState(filters, tagState, strengthState);
	};
	
	
	this.renderFilters = function(filters, tagState, strengthState){
		remClass(this.filterElems.letter || nodes.lettersAll, styles.selected);
		if(filters.letter != "") {
            var letterElems = cssQuery("a", nodes.alphabetRu).concat(nodes.lettersAll);

			for(var i = 0; i < letterElems.length; i++) {
				if(letterElems[i].innerHTML == filters.letter.toLowerCase()){
					this.filterElems.letter = letterElems[i];
					break;
				}
			}   
		} else this.filterElems.letter = nodes.lettersAll;
		this.filterElems.letter.addClassName(styles.selected);
		
		var tagElems = nodes.tagsList.getElementsByTagName("dd");
		for(var i = 0; i < tagElems.length; i++) {
			var elemTxt = tagElems[i].getElementsByTagName("span")[0].innerHTML.toLowerCase();
			if(elemTxt == filters.tag) {
			    this.filterElems.tag = tagElems[i];
			    this.filterElems.tag.className = styles.selected;
			} else if(tagState.indexOf(elemTxt) == -1) {
				  tagElems[i].className = styles.disabled;
			} else {
				  tagElems[i].className = "";
			}
		}
		
		var strengthElems = nodes.strengthsList.getElementsByTagName("dd");
		for(var i = 0; i < strengthElems.length; i++) {
			var elemTxt = strengthElems[i].getElementsByTagName("span")[0].innerHTML.toLowerCase();
			if(elemTxt == filters.strength) {
			    this.filterElems.strength = strengthElems[i]; 
			    this.filterElems.strength.className = styles.selected;
      } else if(strengthState.indexOf(elemTxt) == -1) {
			    strengthElems[i].className = styles.disabled
			} else {
			    strengthElems[i].className = "";
			}
		}
		
		var ingredientsParent = nodes.searchesList;
		ingredientsParent.empty();
		if(filters.ingredients.length > 0) {
			var ingreds = filters.ingredients;
			for(var i = 0; i < ingreds.length; i++) {
				ingredientsParent.appendChild(this.createIngredientElement(ingreds[i]));
				if(i != (ingreds.length-1)) ingredientsParent.appendChild(document.createTextNode(" + "));
			}
		}
		
		if(this.currentState == states.byIngredients){
      nodes.searchTipIngredient.setVisible(filters.ingredients.length == 0)
			nodes.ingredsView.setVisible(filters.ingredients.length > 0)
		}
		
		if(filters.page > 0) {
			nodes.resultsDisplay.RollingImagesLite.goToNode($('page_'+filters.page), 'directJump');	
		}

    if(filters.name) {
      cssQuery("input", nodes.searchByName)[0].value = filters.name;
    }
	},
	
	this.renderAllPages = function(resultSet, pageNum){
		this.resultSet = resultSet;
    this.np = this.getNumOfPages(resultSet, this.perPage);
		
		nodes.resultsRoot.empty();
		
    this.renderedPages = [];
    this.renderSkeleton(this.np);
    this.renderNearbyPages(pageNum);

		this.renderPager(this.np);
		nodes.resultsDisplay.RollingImagesLite.sync();
		nodes.resultsDisplay.RollingImagesLite.goInit();
	};
 
  this.renderSkeleton = function(np){
    var parent = nodes.resultsRoot;
    
    for(var i = 0; i < np; i++) {
      var page = document.createElement("div");
		  page.id = "page_" + i;
		  page.className = styles.point;
		  parent.appendChild(page);
	  	if(this.currentState == states.byName ||
			  this.currentState == states.byLetter){
			  page.addClassName(styles.expanded);
		  }
		
		  var ul = document.createElement("ul");
		  ul.id = "ul_" + i;
		  ul.className = "cocktails";
		  page.appendChild(ul);
    }
  }
  
  this.renderNearbyPages = function(pageNum) {
    var pagesToRender = [pageNum - 1, pageNum, pageNum + 1];

    for(var i = 0; i < pagesToRender.length; i++) {
      var j = pagesToRender[i];
      if((j >= 0) && (j < this.np) && (this.renderedPages.indexOf(j) == -1)) this.renderPage(j);
    }
  };

	this.renderSet = function(parent, set){
		for(var i = 0; i < set.length; i++) {
			var dd = document.createElement("dd");
			var a = document.createElement("a");
			a.className = "rem";
			var span = document.createElement("span");
			var txt = document.createTextNode(set[i].capitalize());
			span.appendChild(txt);
			dd.appendChild(span);
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
	
	this.renderPage = function (pageNum) {
		this.renderedPages.push(pageNum);
    var selectedSet = this.resultSet.slice(pageNum*this.perPage, (pageNum+1)*this.perPage);
    
    var ul = $('ul_' + pageNum);

		for (var i = 0; i < selectedSet.length; i++) {
			ul.appendChild(this.createCocktailElement(selectedSet[i]));
		}
	};
	
	this.createCocktailElement = function(cocktail) {
    var id = cocktail.name_eng.htmlName();
    var li = this.nodeCache[id];

    if(!li) {
      li = document.createElement("li");
      var a = document.createElement("a");
		  a.href = "/cocktails/" + id + ".html";
		  var img = document.createElement("img");
		  img.className = "mini-illustration";
		  img.src = "/i/cocktail/s/" + id + ".png";
		  new Draggable(img, cocktail.name, this.dropTargets);
		  var txt = document.createTextNode(cocktail.name);
		  a.appendChild(img);
		  a.appendChild(txt);
		  li.appendChild(a);
      this.nodeCache[id] = li;
		}
    return li;		
	};
	
	this.createIngredientElement = function(name){
		var a = document.createElement("a");
		a.innerHTML = name;
		var self = this;
		a.addEventListener('click', function(e){
			self.onIngredientRemoved(name);
		}, false);
		return a;	
	};
	
	this.getNumOfPages = function(resultSet, perPage) {
		if ((resultSet.length % perPage) == 0) return (resultSet.length/perPage);
		return parseInt(resultSet.length / perPage) + 1;
	};
	
	this.renderPager = function (numOfPages) {
		var span = nodes.pagerRoot;
		span.empty();
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
