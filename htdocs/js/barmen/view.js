;(function(){

var Papa = AllBarmensPage
var Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
	},
	
	modelChanged: function (data)
	{
		
	}
	
	renderBarmenPhoto: function (barmen)
	{
		var li, div, a, span, text, tmp = document.createDocumentFragment()
		var liClassName = 'item'
		var divBackgroundColor = '#eee'
		
		for (var i = 0, il = barmen.length; i < il; i++)
		{
			li = document.createElement('li')
			li.className = liClassName
			div = document.createElement('div')
			div.style.backgroundImage = 'url(' + barmen[i].getPhoto() + ')'
			a = document.createElement('a')
			a.href = barmen[i].path
			span = document.createElement('span')
			text = document.createTextNode(barmen[i].name)
			span.appendChild(text)
			a.appendChild(span)
			div.appendChild(a)
			
			li.appendChild(div)
			tmp.appendChild(li)
		}
		
		this.nodes.loadingNode.hide()
		this.nodes.barmensList.appendChild(tmp)
		
		this.nodes.barmanListItems = $$('li.item div')
	}
}

Object.extend(Me.prototype, myProto)

})();
