;(function(){

function remClass(elem, className) { if(elem) elem.removeClassName(className) }

function Me (nodes)
{
	this.riJustInited  = true;
	this.filterElems   = { letter: null }
	this.perPage       = 20;
	this.np            = -1;
	this.renderedPages = {}
	this.nodeCache     = []
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.dropTargets =
		[
			this.nodes.cartEmpty,
			this.nodes.cartFull
		]
		
		new RollingImagesLite(this.nodes.resultsDisplay, {animationType: 'easeInOutQuad', duration:0.75})
		
		this.fixHashChange()
		this.bindEvents()
	},
	
	fixHashChange: function ()
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
	},
	
	checkRequest: function ()
	{
		var filters = this.filtersFromRequest()
		this.controller.onFiltersChanged(filters)
	},
	
	filtersFromRequest: function ()
	{
		var m = window.location.href.match(/#(.+)$/)
		if (!m)
			return
		
		var filters = UrlEncode.parse(m[1])
		filters.page = +filters.page || 0
		return filters
	},
	
	saveFilters: function (filters) {
		var self = this;
		clearTimeout(this.hashTimeout);
		this.hashTimeout = setTimeout(function() { 
			self.updatePageHash(filters);
		} , 400);
	},
	
	updatePageHash: function (filters)
	{
		var hash = {}
		for (var k in filters)
		{
			var v = filters[k]
			
			if (!v || v == '*')
				continue
			
			if (k == 'state' && v == 'byName')
				continue
			
			hash[k] = v
		}
		
		window.location.hash = UrlEncode.stringify(hash) || 'i'
		this.currentHash = window.location.hash
	},
	
	bindEvents: function ()
	{
		var self = this;
		
		var nodes = this.nodes
		
		var ril = nodes.resultsDisplay.RollingImagesLite;
		
		nodes.bigPrev.addEventListener('mousedown', function(e){ ril.goPrev() }, false);
		nodes.bigNext.addEventListener('mousedown', function(e){ ril.goNext() }, false);
		
		ril.onselect = function (node, num) {
			if (!self.riJustInited) {
				self.controller.onPageChanged(num);
				self.renderNearbyPages(num, 0)
			} else { self.riJustInited = false }
			
			// big pager buttons
			if(num == (self.np-1) || self.np == 1) nodes.bigNext.addClassName('disabled');
			else nodes.bigNext.removeClassName('disabled');
			if(num == 0 || self.np == 1) nodes.bigPrev.addClassName('disabled');
			else nodes.bigPrev.removeClassName('disabled');
		}
		
		nodes.searchByName.getElementsByTagName("form")[0].addEventListener('submit', function(e) { e.preventDefault() }, false);
		var searchByNameInput = nodes.searchByName.getElementsByTagName("input")[0];
		searchByNameInput.addEventListener('keyup', function(e){ self.controller.onNameFilter(this.value) }, false);
		
		var nameSearchHandler = function (e) {
			searchByNameInput.value = this.innerHTML;
			self.controller.onNameFilter(this.innerHTML);
			nodes.panels.addClassName('just-suggested')
		}
		
		nodes.searchExampleName.addEventListener('mousedown', nameSearchHandler, false);
		nodes.searchExampleNameEng.addEventListener('mousedown', nameSearchHandler, false);
		
		var controller = this.controller
		function tabClicked (e)
		{
			var name = e.target.getAttribute('data-tab-name')
			if (!name)
				return
			controller.onTabSelected(name)
		}
		nodes.tabsRoot.addEventListener('click', tabClicked, false)
	},
	
	turnToState: function (state)
	{
		var nodes = this.nodes
		
		var last = nodes.tabs[this.lastState]
		if (last)
			last.removeClassName('selected')
		
		this.lastState = state
		
		var present = nodes.tabs[state]
		if (present)
			present.addClassName('selected')
		
		nodes.panels.className = state
		
		if (state == 'byName')
		{
			nodes.searchByNameInput.value = ''
			nodes.searchByNameInput.focus()
		}
	},
	
	renderRandomCocktail: function (cocktail)
	{
		var nodes = this.nodes
		nodes.searchExampleName.innerHTML = cocktail.name
		nodes.searchExampleNameEng.innerHTML = cocktail.name_eng
	},
	
	onModelChanged: function(resultSet, filters) { // model
		this.currentFilters = filters;
		
		this.renderAllPages(resultSet, filters.page);
		this.renderFilters(this.currentFilters);
	},
	
	renderFilters: function(filters){
		var nodes = this.nodes
		
		remClass(this.filterElems.letter || nodes.lettersAll, 'selected-button');
		if (filters.letter == '*')
		{
			this.filterElems.letter = nodes.lettersAll
		}
		else
		{
			var letterElems = $$("a", nodes.alphabetRu).concat(nodes.lettersAll);
			
			for(var i = 0; i < letterElems.length; i++) {
				if(letterElems[i].innerHTML == filters.letter.toLowerCase()){
					this.filterElems.letter = letterElems[i];
					break;
				}
			}   
		}
		this.filterElems.letter.addClassName('selected-button');
		
		if(filters.page > 0) {
			nodes.resultsDisplay.RollingImagesLite.goToNode($('#page_'+filters.page), 'directJump');
		}
		
		if (filters.name)
		{
			var input = nodes.searchByNameInput
			if (input.value != filters.name)
				input.value = filters.name
		}
	},
	
	renderAllPages: function(resultSet, pageNum){
		var nodes = this.nodes
		
		this.resultSet = resultSet;
		this.np = Math.ceil(resultSet.length / this.perPage)
		
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
	},
	
	renderSkeleton: function (count)
	{
		var nodes = this.nodes,
			parent = nodes.resultsRoot,
			pages = nodes.pages = []
		
		for (var i = 0; i < count; i++)
		{
			var page = pages[i] = document.createElement('ul')
			page.id = 'page_' + i
			page.className = 'point cocktails';
			parent.appendChild(page)
		}
	},
	
	renderNearbyPages: function (num, delta)
	{
		if (delta === undefined)
			delta = 1
		
		for (var i = num - delta; i <= num + delta; i++)
			if(i >= 0 && i < this.np && !this.renderedPages[i])
				this.renderPage(i)
	},
	
	renderLetters: function (set){
		var nodes = this.nodes
		
		var controller = this.controller
		function click (e)
		{
			var letter = e.target.dataLetter
			controller.onLetterFilter(letter);
		}
		
		nodes.lettersAll.dataLetter = '*'
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
	
	renderPage: function (num)
	{
		var nodes = this.nodes
		
		var cocktails = this.resultSet,
			node, cocktail, cache = this.nodeCache,
			parent = nodes.pages[num],
			end = (num + 1) * this.perPage,
			dropTargets = this.dropTargets
		
		function bindDragData (node, data)
		{
			function onDragStart (e)
			{
				e.dataTransfer.setData('text', data)
			}
			node.addEventListener('dragstart', onDragStart, false)
		}
		
		for (var i = num * this.perPage; i < end; i++)
		{
			var item = document.createElement('li')
			item.className = 'item'
			
			if (!(node = cache[i]))
			{
				if (!(cocktail = cocktails[i]))
					continue
				node = cache[i] = cocktail.getPreviewNodeCropped()
				bindDragData(node, cocktail.name)
			}
			item.appendChild(node)
			parent.appendChild(item)
		}
		
		this.renderedPages[num] = true
	},
	
	renderPager: function (numOfPages) {
		var span = this.nodes.pagerRoot;
		span.empty();
		for (var i = 1; i <= numOfPages; i++) {
			var a = document.createElement("a");
			a.className= i >= 10 ? "button two" : "button";
			a.appendChild(document.createTextNode(i));
			span.appendChild(a);
			span.appendChild(document.createTextNode(' '))
		}
	}
}

Papa.View = Me

})();