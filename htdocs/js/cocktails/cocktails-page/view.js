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
		
		var nameSearchHandler = function (e) {
			var text = this.innerText
			nodes.searchByNameInput.value = text
			view.changeHashName(text)
		}
		
		nodes.searchExampleName.addEventListener('mousedown', nameSearchHandler, false);
		nodes.searchExampleNameEng.addEventListener('mousedown', nameSearchHandler, false);
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
		var nodes = this.nodes
		nodes.searchExampleName.innerText = cocktail.name
		nodes.searchExampleNameEng.innerText = cocktail.name_eng
	},
	
	renderMoreCocktails: function (cocktails, left)
	{
		var nodes = this.nodes,
			container = nodes.cocktailsList
		
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
		this.renameMoreButton(Math.min(count, this.cocktailsPerPage))
	},
	
	showMoreButton: function ()
	{
		this.nodes.more.show()
	},
	
	hideMoreButton: function ()
	{
		this.nodes.more.hide()
	},
	
	renameMoreButton: function (count)
	{
		this.nodes.more.innerText = 'еще ' + count + ' ' + count.plural('коктейль', 'коктейля', 'коктейлей')
	}

}

Papa.View = Me

})();