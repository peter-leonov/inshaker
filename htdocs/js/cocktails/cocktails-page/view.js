;(function(){

function Me () {}

eval(NodesShortcut.include())

var UrlEncodeLight = {}
Object.extend(UrlEncodeLight, UrlEncode)
UrlEncodeLight.encode = function (v) { return ('' + v).replace('&', '%26') }
UrlEncodeLight.decode = function (v) { return ('' + v).replace('%26', '&') }

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var controller = this.controller
		nodes.more.addEventListener('click', function (e) { controller.addMoreCocktails() }, false)
		
		var lh = this.lh = new LocationHash().bind()
		var view = this
		lh.addEventListener('change', function (e) { view.hashUpdated() }, false)
		
		nodes.searchForm.addEventListener('submit', function(e) { e.preventDefault() }, false);
		nodes.searchByNameInput.addEventListener('keyup', function(e){ view.changeHashName(this.value) }, false);
	},
	
	hashUpdated: function ()
	{
		var hash = UrlEncodeLight.parse(this.lh.get()),
			name = hash.name || ''
		
		this.controller.hashUpdated(name)
		
		this.nodes.searchByNameInput.value = name
	},
	
	changeHashName: function (name)
	{
		var nameHash = {}
		if (name)
			nameHash.name = name
		
		this.lh.set(UrlEncodeLight.stringify(nameHash) || 'i')
		
		this.controller.hashUpdated(name)
	},
	
	renderRandomCocktail: function (cocktail)
	{
		this.nodes.searchByNameInput.placeholder = cocktail.name
	},
	
	renderMoreCocktails: function (cocktails, left)
	{
		var nodes = this.nodes,
			container = nodes.cocktailsList
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var item = Nc('li', 'item')
			item.appendChild(cocktails[i].getPreviewNodeCropped())
			container.appendChild(item)
		}
		
		var eventBoxChanged = document.createEvent('Event')
		eventBoxChanged.initEvent('inshaker-box-changed', true, true)
		container.dispatchEvent(eventBoxChanged)
		
		this.renderMoreButton(left)
	},
	
	renderNewCocktails: function (cocktails, left)
	{
		this.nodes.cocktailsList.empty()
		this.nodes.resultsDisplay.classList.remove('empty')
		this.renderMoreCocktails(cocktails, left)
	},
	
	notHaveCocktails: function ()
	{
		this.nodes.cocktailsList.empty()
		this.nodes.resultsDisplay.classList.add('empty')
	},
	
	setCocktailsPerPage: function (count)
	{
		this.cocktailsPerPage = count
	},

	renderMoreButton: function (count)
	{
		if (count <= 0)
		{
			this.hideMoreButton()
			return
		}
		
		this.showMoreButton()
		
		count = Math.min(count, this.cocktailsPerPage)
		this.nodes.more.innerHTML = 'еще ' + count + ' ' + count.plural('коктейль', 'коктейля', 'коктейлей')
	},
	
	showMoreButton: function ()
	{
	  this.nodes.root.classList.remove('common-bottom')
		this.nodes.moreHolder.show()
	},
	
	hideMoreButton: function ()
	{
	  this.nodes.root.classList.add('common-bottom')
		this.nodes.moreHolder.hide()
	},
	
	renameMoreButton: function (count)
	{
		
	}

}

Papa.View = Me

})();