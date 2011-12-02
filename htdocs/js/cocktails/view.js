function remClass(elem, className) { if(elem) elem.removeClassName(className) };
function setVisible (elem, b) { b ? elem.show() : elem.hide() }

function CocktailsView (states, nodes, styles) {
	
	new RollingImagesLite(nodes.resultsDisplay, {animationType: 'easeInOutQuad', duration:0.75});
	
	this.filterElems   = { letter: null };
	this.perPage       = 20;
	this.np            = -1;
	this.renderedPages = {}
	this.nodeCache     = []
	
	
	this.riJustInited  = true;
	this.dropTargets   = [nodes.cartEmpty, nodes.cartFull];
	
	this.currentState;
	this.currentFilters;
	this.stateSwitcher;
	this.resultSet; // for caching purposes only
	
	this.initialize = function ()
	{
		this.fixHashChange()
		this.bindEvents()
	};
	
	this.fixHashChange = function ()
	{
		// fix for cocktails initialization issue
		this.currentHash = window.location.hash
		var me = this
		function checkHash ()
		{
			if (me.currentHash != window.location.hash)
				window.location.reload(true)
		}
		setInterval(checkHash, 250)
	}
	
	this.checkRequest = function ()
	{
		var filters = this.filtersFromRequest()
		this.controller.onFiltersChanged(filters)
	}
	
	this.filtersFromRequest = function () {
		var address = window.location.href;
		var match = address.match(/.+\#(.+)/);
		if(match){
			var params = match[1].split("&");
			var filters = {};
			for(var i = 0; i < params.length; i++) {
				var pair = params[i].split("=");
				filters[pair[0]]=decodeURIComponent(pair[1]);
			}
            filters.state = states[filters.state];
			filters.page = +filters.page || 0
			return filters;
		} else return null;
	};
	
	this.saveFilters = function (filters) {
		var self = this;
		clearTimeout(this.hashTimeout);
		this.hashTimeout = setTimeout(function() { 
			self.updatePageHash(filters);
		} , 400);
	};
	
	this.updatePageHash = function(filters) {
		var pairs = [];
		for(var key in filters)
			if(filters[key] != "" || (filters[key] === 0 && key != "page")) {
				var value = filters[key];
				if(key == "state") value = keyForValue(states, value)
				pairs.push([key, value]);
			}
		
		var hash = [], encode = encodeURIComponent;
		for(var i = 0; i < pairs.length; i++) {
			hash[i] = encode(pairs[i][0]) + "=" + encode(pairs[i][1]);
		}
		if (hash)
		{
			window.location.hash = hash.join('&')
			this.currentHash = window.location.hash
		}
	};
	
	this.bindEvents = function () {
		var self = this;
		
		
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
		
		var nameSearchHandler = function (e) {
			searchByNameInput.value = this.innerHTML;
			self.controller.onNameFilter(this.innerHTML);
			nodes.searchTipName.hide();
		};
		
		nodes.searchExampleName.addEventListener('mousedown', nameSearchHandler, false);
		nodes.searchExampleNameEng.addEventListener('mousedown', nameSearchHandler, false);
		
		this.stateSwitcher = Switcher.bind(nodes.searchTabs, nodes.searchTabs.getElementsByTagName("li"),
						[nodes.searchByName, nodes.searchByLetter, nodes.searchByTags]);
		
		this.stateSwitcher.onselect = function (num) {
			self.turnToState(num);
			self.controller.onStateChanged(num);
		}
	};
	
	this.turnToState = function(state){
		this.currentState = state;
		this.stateSwitcher.drawSelected(state);
		
		var viewport = nodes.mainArea.getElementsByClassName("viewport")[0]; 
		
		var bodyWrapper = nodes.bodyWrapper
		for (var k in states)
			// toggleClassName(k, states[k] == state) must be used
			states[k] == state ? bodyWrapper.addClassName(k) : bodyWrapper.removeClassName(k)
		
		setVisible(nodes.searchTipName, state == states.byName)
		if(state != states.byName) $$("input", nodes.searchByName)[0].value = "";
	};
	
	this.onModelChanged = function(resultSet, filters) { // model
		this.currentFilters = filters;
		
		this.renderAllPages(resultSet, filters.page);
		this.renderFilters(this.currentFilters);
	};
	
	this.renderFilters = function(filters){
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
		
		if(filters.page > 0) {
			nodes.resultsDisplay.RollingImagesLite.goToNode($('page_'+filters.page), 'directJump');	
		}
		
		if (filters.name)
		{
			var input = nodes.searchByNameInput
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
	
	this.renderLetters = function (set){
		var controller = this.controller
		function click (e)
		{
			var letter = e.target.dataLetter
			controller.onLetterFilter(letter, 
										nodes.lettersAll.innerHTML.toUpperCase());
		}
		
		nodes.lettersAll.addEventListener('click', click, false)
		
		var parent = nodes.alphabetRu
		
		for(var i = 0; i < set.length; i++){
			var a = document.createElement("a");
			a.innerHTML = set[i];
			a.dataLetter = set[i]
			parent.appendChild(a);
			a.addEventListener('click', click, false)
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
				node = cache[i] = cocktail.getPreviewNodeCropped()
				node.img.__draggable = [cocktail.name, dropTargets]
			}
			item.appendChild(node)
			parent.appendChild(item)
		}
		
		this.renderedPages[num] = true
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
