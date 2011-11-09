function remClass(elem, className) { if(elem) elem.removeClassName(className) };
function setVisible (elem, b) { b ? elem.show() : elem.hide() }

function CocktailsView (states, nodes, styles) {
	
	new RollingImagesLite(nodes.resultsDisplay, {animationType: 'easeInOutQuad', duration:0.75});
	
	this.filterElems   = { tag: null, strength: null, method: null, letter: null };
	this.perPage       = 16;
	this.np            = -1;
	this.renderedPages = {}
	this.nodeCache     = []
	
	
	this.riJustInited  = true;
	this.dropTargets   = [nodes.cartEmpty, nodes.cartFull];
	
	this.currentState;
	this.currentFilters;
	this.stateSwitcher;
	this.resultSet; // for caching purposes only
	
	this.initialize = function (viewData, state)
	{
		this.viewData = viewData
		
		var set = viewData.ingredients.slice()
		set.push.apply(set, viewData.names)
		set = set.sort()
		
		var searcher = this.searcher = new IngredientsSearcher(set, viewData.byName)
		var completer = this.completer = new Autocompleter().bind(nodes.searchByIngredsInput)
		completer.setDataSource(searcher)
		
		this.renderLetters(nodes.alphabetRu,     this.viewData.letters);
		this.renderGroupSet(nodes.tagsList,      this.viewData.tags);
		this.renderGroupSet(nodes.strengthsList, this.viewData.strengths);
		this.renderGroupSet(nodes.methodsList,   this.viewData.methods);
		
		this.bindEvents();
		this.turnToState(state);
	};
	
	this.bindEvents = function () {
		var self = this;
		
		var letterLinks = $$("a", nodes.alphabetRu).concat(nodes.lettersAll);
		for(var i = 0; i < letterLinks.length; i++){
			letterLinks[i].addEventListener('mousedown', function(e){
				self.controller.onLetterFilter(e.target.innerHTML.toUpperCase(), 
											nodes.lettersAll.innerHTML.toUpperCase());
			}, false);
		}
		
		var tagLinks = $$("dd", nodes.tagsList);
		for(var i = 0; i < tagLinks.length; i++){
			tagLinks[i].addEventListener('mousedown', function(num){ return function(){
				if(!tagLinks[num].hasClassName(styles.disabled)) {
					self.controller.onTagFilter(this.value)
				}
			}}(i), false);
		}
		
		var strengthLinks = $$("dd", nodes.strengthsList);
		for(var i = 0; i < strengthLinks.length; i++){
			strengthLinks[i].addEventListener('mousedown', function(num){ return function(){
				if(!strengthLinks[num].hasClassName(styles.disabled)) {
					self.controller.onStrengthFilter(this.innerHTML.toLowerCase());
				}
			}}(i), false);
		}

		var methodLinks = $$("dd", nodes.methodsList);
		for(var i = 0; i < methodLinks.length; i++){
			methodLinks[i].addEventListener('mousedown', function(num){ return function(){
				if(!methodLinks[num].hasClassName(styles.disabled)) {
					self.controller.onMethodFilter(this.innerHTML.toLowerCase());
				}
			}}(i), false);
		}
		
		var ril = nodes.resultsDisplay.RollingImagesLite;
		
		nodes.bigPrev.addEventListener('mousedown', function(e){ ril.goPrev() }, false);
		nodes.bigNext.addEventListener('mousedown', function(e){ ril.goNext() }, false);
		
		ril.onselect = function (node, num) {
			if (!self.riJustInited) {
				self.controller.onPageChanged(num);
				self.renderNearbyPages(num, 0)
			} else { self.riJustInited = false }
			
			// big pager buttons
			if(num == (self.np-1) || self.np == 1) nodes.bigNext.addClassName(styles.disabled);
			else nodes.bigNext.removeClassName(styles.disabled);
			if(num == 0 || self.np == 1) nodes.bigPrev.addClassName(styles.disabled);
			else nodes.bigPrev.removeClassName(styles.disabled);
		}
		
		nodes.searchExampleIngredient.addEventListener('mousedown', function(e){ self.onIngredientAdded(this.innerHTML) }, false);
		
		nodes.searchByName.getElementsByTagName("form")[0].addEventListener('submit', function(e) { e.preventDefault() }, false);
		var searchByNameInput = nodes.searchByName.getElementsByTagName("input")[0];
		searchByNameInput.addEventListener('keyup', function(e){ self.controller.onNameFilter(this.value) }, false);
		
		nodes.searchTipName.realShow = nodes.searchTipName.show
		nodes.searchTipName.show = function () {
			this.realShow()
			var names = self.controller.needRandomCocktailNames();
			nodes.searchExampleName.innerHTML = names[0];
			nodes.searchExampleNameEng.innerHTML = names[1];
		};
		
		nodes.removeAllIngreds.addEventListener('click', function(e){
				self.onAllIngredientsRemoved();
			}, false);
		
		nodes.searchTipIngredient.realShow = nodes.searchTipIngredient.show
		nodes.searchTipIngredient.show = function () {
			this.realShow()
			nodes.searchExampleIngredient.innerHTML = self.controller.needRandomIngredient();
		};
		
		nodes.ingredsView.realShow = nodes.ingredsView.show
		nodes.ingredsView.show = function(){
			this.realShow()
			nodes.searchTips.hide();
		}
		
		nodes.ingredsView.realHide = nodes.ingredsView.hide
		nodes.ingredsView.hide = function(){
			this.realHide()
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
		
		function changeListener (e)
		{
			nodes.searchByIngredsInput.value = ''
			self.onIngredientAdded(e.data.value)
			return false // prevents input value blinking in FF
		}
		this.completer.onconfirm = changeListener
		nodes.searchByIngredsForm.addEventListener('submit', function (e) { e.preventDefault() }, false)
	};
	
	this.turnToState = function(state){
		this.currentState = state;
		this.stateSwitcher.drawSelected(state);
		
		var viewport = nodes.mainArea.getElementsByClassName("viewport")[0]; 
		
		var bodyWrapper = nodes.bodyWrapper
		for (var k in states)
			// toggleClassName(k, states[k] == state) must be used
			states[k] == state ? bodyWrapper.addClassName(k) : bodyWrapper.removeClassName(k)
		
		if(state == states.byIngredients) {
			nodes.tagStrengthArea.show();
			this.perPage = 16;
		} else {
			nodes.tagStrengthArea.hide();
			this.perPage = 20;
		}
		
		nodes.ingredsView.hide();
		setVisible(nodes.searchTipIngredient, state == states.byIngredients)
		setVisible(nodes.searchTipName, state == states.byName)
		if(state != states.byName) $$("input", nodes.searchByName)[0].value = "";
	};
	
	this.onAllIngredientsRemoved = function () {
		this.controller.onIngredientFilter();
	};
	
	this.onIngredientAdded = function(name)
	{
		var markToken = 'марка '
		if (name.indexOf(markToken) == 0)
			this.controller.onMarkAddFilter(name.substr(markToken.length), false)
		else
			this.controller.onIngredientFilter(name, false)
	}
	
	this.onIngredientRemoved = function(name) {
		this.controller.onIngredientFilter(name, true);
	};
	
	this.onModelChanged = function(resultSet, filters, groupStates) { // model
		this.currentFilters = filters;
		
		this.renderAllPages(resultSet, filters.page);
		this.renderFilters(this.currentFilters, groupStates.tags, groupStates.strengths, groupStates.methods);
		this.controller.saveFilters(this.currentFilters);
		
		var withouts = this.searcher.withouts = {},
			ingredients = filters.ingredients;
		
		for (var i = 0, il = ingredients.length; i < il; i ++){
			withouts[ingredients[i]] = true;
		}
	};
	
	this.renderFilters = function(filters, tagState, strengthState, methodState){
		remClass(this.filterElems.letter || nodes.lettersAll, styles.selected);
		if(filters.letter != "") {
			var letterElems = $$("a", nodes.alphabetRu).concat(nodes.lettersAll);
			
			for(var i = 0; i < letterElems.length; i++) {
				if(letterElems[i].innerHTML == filters.letter.toLowerCase()){
					this.filterElems.letter = letterElems[i];
					break;
				}
			}   
		} else this.filterElems.letter = nodes.lettersAll;
		this.filterElems.letter.addClassName(styles.selected);
		
		// TODO: simplify this code with nodes[...] while avoiding the copy-paste
		for (var k in tagState)
			tagState[k.toLowerCase()] = true
		var tagElems = nodes.tagsList.getElementsByTagName("dd");
		for(var i = 0; i < tagElems.length; i++) {
			var elemTxt = tagElems[i].value.toLowerCase()
			if(elemTxt == filters.tag.toLowerCase()) {
				this.filterElems.tag = tagElems[i];
				this.filterElems.tag.className = styles.selected;
			} else if(!tagState[elemTxt]) {
				tagElems[i].className = styles.disabled;
			} else {
				tagElems[i].className = "";
			}
		}
		
		for (var k in strengthState)
			strengthState[k.toLowerCase()] = true
		var strengthElems = nodes.strengthsList.getElementsByTagName("dd");
		for(var i = 0; i < strengthElems.length; i++) {
			var elemTxt = strengthElems[i].innerHTML.toLowerCase();
			if(elemTxt == filters.strength.toLowerCase()) {
				this.filterElems.strength = strengthElems[i]; 
				this.filterElems.strength.className = styles.selected;
			} else if(!strengthState[elemTxt]) {
				strengthElems[i].className = styles.disabled
			} else {
				strengthElems[i].className = "";
			}
		}
		
		for (var k in methodState)
			methodState[k.toLowerCase()] = true
		var methodElems = nodes.methodsList.getElementsByTagName("dd");
		for(var i = 0; i < methodElems.length; i++) {
			var elemTxt = methodElems[i].innerHTML.toLowerCase();
			if(elemTxt == filters.method.toLowerCase()) {
				this.filterElems.method = methodElems[i]; 
				this.filterElems.method.className = styles.selected;
			} else if(!methodState[elemTxt]) {
				methodElems[i].className = styles.disabled
			} else {
				methodElems[i].className = "";
			}
		}
		
		var ingredientsParent = nodes.searchesList;
		ingredientsParent.empty();
		
		var words = filters.marks.concat(filters.ingredients)
		for (var i = 0, il = words.length; i < il; i++)
		{
			ingredientsParent.appendChild(this.createIngredientElement(words[i]));
			if (i != (il-1))
				ingredientsParent.appendChild(document.createTextNode(" + "));
		}
		
		if(this.currentState == states.byIngredients){
			setVisible(nodes.searchTipIngredient, words.length == 0)
			setVisible(nodes.ingredsView, words.length > 0)
		}
		
		if(filters.page > 0) {
			nodes.resultsDisplay.RollingImagesLite.goToNode($('page_'+filters.page), 'directJump');	
		}
		
		if (filters.name)
		{
			var input = $$("input", nodes.searchByName)[0]
			if (input.value != filters.name)
				input.value = filters.name
		}
	},
	
	this.renderAllPages = function(resultSet, pageNum){
		this.resultSet = resultSet;
		this.np = this.getNumOfPages(resultSet, this.perPage);
		
		nodes.resultsRoot.empty();
		
		if (resultSet.length)
			nodes.resultsDisplay.removeClassName('empty')
		else
			nodes.resultsDisplay.addClassName('empty')
			
		
		this.renderedPages = {}
		this.nodeCache     = []
		this.renderSkeleton(this.np);
		this.renderNearbyPages(pageNum);
		
		this.renderPager(this.np);
		nodes.resultsDisplay.RollingImagesLite.sync();
		nodes.resultsDisplay.RollingImagesLite.goInit();
	};
	
	this.renderSkeleton = function (count)
	{
		var parent = nodes.resultsRoot, pages = nodes.pages = []
		for (var i = 0; i < count; i++)
		{
			var page = pages[i] = document.createElement('ul')
			page.id = 'page_' + i
			page.className = 'point cocktails';
			parent.appendChild(page)
		}
	}
	
	this.renderNearbyPages = function (num, delta)
	{
		if (delta === undefined)
			delta = 1
		
		for (var i = num - delta; i <= num + delta; i++)
			if(i >= 0 && i < this.np && !this.renderedPages[i])
				this.renderPage(i)
	}
	
	this.renderGroupSet = function(parent, set){
		for(var i = 0; i < set.length; i++) {
			var dd = document.createElement("dd");
			dd.value = set[i]
			var span = document.createElement("span");
			var txt = document.createTextNode(set[i].capitalize());
			dd.appendChild(txt);
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
	
	this.renderPage = function (num)
	{
		var cocktails = this.resultSet,
			node, cocktail, cache = this.nodeCache,
			parent = nodes.pages[num],
			end = (num + 1) * this.perPage,
			dropTargets = this.dropTargets
		
		for (var i = num * this.perPage; i < end; i++)
		{
			var item = document.createElement('li')
			item.className = 'item'
			
			if (!(node = cache[i]))
			{
				if (!(cocktail = cocktails[i]))
					continue
				node = cache[i] = cocktail.getPreviewNode2()
				node.img.__draggable = [cocktail.name, dropTargets]
			}
			item.appendChild(node)
			parent.appendChild(item)
		}
		
		this.renderedPages[num] = true
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
		for (var i = 1; i <= numOfPages; i++) {
			var a = document.createElement("a");
			a.className= i >= 10 ? "button two" : "button";
			a.appendChild(document.createTextNode(i));
			span.appendChild(a);
			span.appendChild(document.createTextNode(' '))
		}
	};
}
