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
		var num, ci = false, m
		
		if ((m = window.location.hash.match(/#(\d+)/)))
		{
			num = m[1] * 1
			ci  = true
		}
		this.model.setState({initFrame: num, customInit: ci})
	},
	
	updateHash: function (frame)
	{
		window.location.hash = frame
	}
}
