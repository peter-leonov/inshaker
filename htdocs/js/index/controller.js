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
        var num = 1, ci = false

        if (window.location.hash.match(/#(\d+)/))
        { 
            num = window.location.hash.match(/#(\d+)/)[1] * 1
		    ci  = true
        }
        this.model.setState({initFrame: num, customInit: ci })
	},

    updateHash: function (frame)
    {
        window.location.hash = frame
    }
  
}

