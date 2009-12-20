function IndexPageController ()
{
	IndexPageController.name = "IndexPageController"
	this.constructor = IndexPageController
	this.initialize.apply(this, arguments)
}

IndexPageController.prototype =
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
