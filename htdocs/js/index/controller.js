function IndexPageController ()
{
	IndexPageController.name = "IndexPageController"
	this.constructor = IndexPageController
	this.initialize.apply(this, arguments)
}

IndexPageController.prototype =
{
	initialize: function ()
	{
		
	},
	
	start: function ()
	{
		this.model.setState({})
	}
  
}

