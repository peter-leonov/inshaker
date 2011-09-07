;(function(){

var myName = 'ToolPopup'

eval(NodesShortcut.include())

var Super = Popup,
	superProto = Super.prototype

function Me ()
{
	Super.apply(this)
}

Me.prototype = new Super()

var myProto =
{
	setTool: function (tool)
	{
		this.tool = tool
		this.render()
	},
	
	show: function ()
	{
		Statistics.toolPopupOpened(this.tool)
		return superProto.show.apply(this, arguments)
	},
	
	renderToolPopup: function(tool){
		Statistics.toolPopupOpened(tool)
		var good = Good.getBySellName(tool.name)[0]
		
		if (good)
		{
			$('tool_buy').parentNode.show()
			$('tool_buy').href = good.getHref()
			$('tool_buy').innerHTML = good.name
		}
		else
			$('tool_buy').parentNode.hide()
		
		
		$('tool_name').innerHTML = tool.name;
		$('tool_desc').innerHTML = tool.desc;
		$('tool_picture').src = tool.imgSrc();
	},
	
	render: function ()
	{
		var clone = this.cloner.create()
		this.popupRoot.appendChild(clone.root)
		
		var nodes = clone.nodes
		nodes.root = clone.root
		
		// implies this.nodes = nodes
		this.bind(nodes)
		
		this.renderContent()
		var popup = this
		setTimeout(function () { popup.renderCocktails() }, 0)
	},
	
	renderContent: function ()
	{
		var nodes = this.nodes,
			tool = this.tool
		
		nodes.name.appendChild(T(tool.name))
		nodes.image.src = tool.imgSrc()
		nodes.text.innerHTML = tool.desc
		
		var good = Good.getBySellName(tool.name)[0]
		if (good)
		{
			nodes.toolWindow.addClassName('can-buy')
			nodes.buy.appendChild(T(good.name))
			nodes.buy.href = good.getHref()
		}
	},
	
	renderCocktails: function ()
	{
		var nodes = this.nodes,
			tool = this.tool
		
		var cocktails = Cocktail.getByTool(tool.name)
		var cl = new CocktailList()
		cl.bind(nodes.cocktails)
		cl.configure({pageLength: 5, pageVelocity: 38})
		cl.setCocktails(cocktails)
	}
}

Object.extend(Me.prototype, myProto)

var myStatic =
{
	bind: function (nodes)
	{
		this.cache = {}
		
		var proto = this.prototype
		
		proto.popupRoot = nodes.root
		
		var cloner = proto.cloner = new Cloner()
		cloner.bind(nodes.popupMain, nodes.popupParts)
	},
	
	show: function (tool)
	{
		this.hide()
		
		var popup = this.cache[tool.name]
		if (!popup)
		{
			popup = this.cache[tool.name] = new this()
			popup.setTool(tool)
		}
		
		popup.show()
		this.popup = popup
		return popup
	},
	
	hide: function ()
	{
		var popup = this.popup
		if (!popup)
			return
		
		popup.hide()
		this.popup = null
	},
	
	bootstrap: function ()
	{
		var nodes =
		{
			root: document.body,
			popupMain: $('tool-info-popup'),
			popupParts:
			{
				window: $$('#tool-info-popup .popup-window')[0],
				toolWindow: $$('#tool-info-popup .popup-window .tool-window')[0],
				front: $$('#tool-info-popup .popup-front')[0],
				image: $$('#tool-info-popup .description .image')[0],
				buy: $$('#tool-info-popup .description .about .where-to-buy .link')[0],
				name: $$('#tool-info-popup .description .about .name')[0],
				text: $$('#tool-info-popup .description .about .text')[0],
				cocktails:
				{
					root: $$('#tool-info-popup .cocktail-list')[0],
					viewport: $$('#tool-info-popup .cocktail-list .viewport')[0],
					surface: $$('#tool-info-popup .cocktail-list .surface')[0],
					prev: $$('#tool-info-popup .cocktail-list .prev')[0],
					next: $$('#tool-info-popup .cocktail-list .next')[0]
				}
			}
		}
		
		this.bind(nodes)
		
		Ingredient.calculateEachIngredientUsage()
	}
}

Object.extend(Me, myStatic)

Me.className = myName
self[myName] = Me

})();