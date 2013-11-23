;(function(){

var myName = 'ShopPoint'

function Me (shop)
{
	this.shop = shop
	this.ll = {lat: shop.point[0], lng: shop.point[1]}
}

Me.prototype = new MapLightMarker()

eval(NodesShortcut.include())

var myProto =
{
	createNode: function ()
	{
		return this.node || (this.node = this.getNode())
	},
	
	getNode: function ()
	{
		var main = Nc('div', 'point')
		
		var icon = main.appendChild(Nc('a', 'icon'))
		icon.href = '/shop/'
		
		var wider = main.appendChild(Nc('div', 'wider'))
		var title = wider.appendChild(Nc('dl', 'title'))
		
		title.appendChild(Nct('dt', 'point-name', this.shop.name))
		
		var contacts = this.shop.contacts
		if (contacts)
		{
			title.appendChild(Nct('dd', 'address', contacts.address))
			title.appendChild(Nct('dd', 'tel', contacts.tel))
		}
		
		return main
	}
}

Object.extend(Me.prototype, myProto)

Me.className = myName
window[myName] = Me

})();
