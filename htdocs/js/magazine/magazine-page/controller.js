function MagazinePageController ()
{
	MagazinePageController.name = "MagazinePageController"
	this.constructor = MagazinePageController
	this.initialize.apply(this, arguments)
}

MagazinePageController.prototype =
{
	initialize: function () {},
	
	start: function ()
	{
		var hash = window.location.hash.replace(/^#/, '')
		hash = UrlEncode.parse(hash)
		this.model.setState({initFrame: hash.name})
	},
	
	updateHash: function (name)
	{
		window.location.hash = UrlEncode.stringify({name: name})
	}
}
