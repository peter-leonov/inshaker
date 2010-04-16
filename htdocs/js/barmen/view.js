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
		
	},
	
	renderBarmen: function (barmen)
	{
		var tmp = document.createDocumentFragment()
		
		for (var i = 0, il = barmen.length; i < il; i++)
		{
			var barman = barmen[i]
			
			var li = Nc('li', 'item')
			var div = N('div')
			div.style.backgroundImage = 'url(' + barman.getPhoto() + ')'
			var a = N('a')
			a.href = barman.pageHref()
			a.appendChild(Nct('span', 'name', barman.name))
			div.appendChild(a)
			
			li.appendChild(div)
			tmp.appendChild(li)
		}
		
		var list = this.nodes.barmensList
		list.empty()
		list.appendChild(tmp)
	}
}

Object.extend(Me.prototype, myProto)

})();
