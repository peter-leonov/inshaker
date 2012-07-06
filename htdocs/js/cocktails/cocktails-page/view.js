;(function(){

function Me (nodes)
{
	this.perPage       = 40;
	this.np            = -1;
	this.renderedPages = {}
	this.nodeCache     = []
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		this.bindEvents()
		
		//this.checkRequest()
		
		var controller = this.controller
		nodes.bigNext.addEventListener('click', function (e) { controller.addMoreCocktails() }, false)
		
		var lh = this.lh = new LocationHash().bind()
		var me = this
		lh.addEventListener('change', function (e) { me.hashUpdated() }, false)
		me.hashUpdated()
	},
	
	hashUpdated: function ()
	{
		var hash = UrlEncode.parse(this.lh.get())
		this.controller.hashUpdated(hash)
	},
	
	checkRequest: function ()
	{
		this.controller.onFiltersChanged({})
	},
	
	saveFilters: function (filters) {
		var self = this;
		window.clearTimeout(this.hashTimeout);
		this.hashTimeout = window.setTimeout(function() {
			self.updatePageHash(filters);
		} , 400);
	},
	
	updatePageHash: function (filters)
	{
		var hash = {}
		for (var k in filters)
		{
			var v = filters[k]
			
			if (!v)
				continue
			
			hash[k] = v
		}
		
		window.location.hash = UrlEncode.stringify(hash) || 'i'
	},
	
	bindEvents: function ()
	{
		var self = this;
		
		var nodes = this.nodes
		
		var num = 1
		/*
		nodes.bigNext.addEventListener('click', function(e)
		{
			num++
			self.controller.onPageChanged(num);
			self.renderNearbyPages(num, 0)
			
			// big pager buttons
			if(num == (self.np-1) || self.np == 1) nodes.bigNext.classList.add('disabled');
			else nodes.bigNext.classList.remove('disabled');
		}, false)		
		*/
		nodes.searchByName.getElementsByTagName("form")[0].addEventListener('submit', function(e) { e.preventDefault() }, false);
		var searchByNameInput = nodes.searchByName.getElementsByTagName("input")[0];
		searchByNameInput.addEventListener('keyup', function(e){ self.controller.onNameFilter(this.value) }, false);
		
		var nameSearchHandler = function (e) {
			searchByNameInput.value = this.innerHTML;
			self.controller.onNameFilter(this.innerHTML);
		}
		
		nodes.searchExampleName.addEventListener('mousedown', nameSearchHandler, false);
		nodes.searchExampleNameEng.addEventListener('mousedown', nameSearchHandler, false);
	},
	
	renderRandomCocktail: function (cocktail)
	{
		var nodes = this.nodes
		nodes.searchExampleName.innerHTML = cocktail.name
		nodes.searchExampleNameEng.innerHTML = cocktail.name_eng
	},
	
	onModelChanged: function(resultSet, filters) { // model
		this.renderAllPages(resultSet, filters.page);
	},
	
	renderAllPages: function(resultSet, pageNum){
		var nodes = this.nodes
		
		this.resultSet = resultSet;
		this.np = Math.ceil(resultSet.length / this.perPage)
		
		nodes.resultsRoot.empty();
		
		if (resultSet.length)
			nodes.resultsDisplay.classList.remove('empty')
		else
			nodes.resultsDisplay.classList.add('empty')
			
		
		this.renderedPages = {}
		this.nodeCache     = []
		this.renderSkeleton(this.np);
		this.renderNearbyPages(pageNum);
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
	
	renderPage: function (num)
	{
		var nodes = this.nodes
		
		var cocktails = this.resultSet,
			node, cocktail, cache = this.nodeCache,
			parent = nodes.pages[num],
			end = (num + 1) * this.perPage
		
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
		
		var eventBoxChanged = document.createEvent('Event')
		eventBoxChanged.initEvent('inshaker-box-changed', true, true)
		nodes.resultsDisplay.dispatchEvent(eventBoxChanged)
	},
	
	renderCocktails: function (cocktails, left)
	{
		var nodes = this.nodes,
			container = nodes.cocktails
		
		function bindDragData (node, data)
		{
			function onDragStart (e)
			{
				e.dataTransfer.setData('text', data)
			}
			node.addEventListener('dragstart', onDragStart, false)
		}
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var item = Nc('li', 'item'),
				cocktail = cocktails[i].getPreviewNodeCropped()
			
			bindDragData(cocktail, cocktail.name)
			item.appendChild(cocktail)
			
			container.appendChild(item)
		}
		
		var eventBoxChanged = document.createEvent('Event')
		eventBoxChanged.initEvent('inshaker-box-changed', true, true)
		nodes.resultsDisplay.dispatchEvent(eventBoxChanged)
	}
}

Papa.View = Me

})();