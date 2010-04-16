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
	
	modelChanged: function (barmen)
	{
		this.renderBarmen(barmen)
	},
	
	renderBarmen: function (barmen)
	{
		var tmp = document.createDocumentFragment()
		
		for (var i = 0, il = barmen.length; i < il; i++)
		{
			var barman = barmen[i]
			
			var item = Nc('li', 'item')
			tmp.appendChild(item)
			
			var preview = Nc('a', 'barman-preview')
			preview.style.backgroundImage = 'url(' + barman.getPhoto() + ')'
			preview.href = barman.pageHref()
			item.appendChild(preview)
			
			preview.appendChild(Nct('span', 'name', barman.name))
		}
		
		var list = this.nodes.barmensList
		list.empty()
		list.appendChild(tmp)
	}
}

Object.extend(Me.prototype, myProto)

})();
