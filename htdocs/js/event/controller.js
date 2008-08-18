EventPage.controller =
{
	owner: null, // must be defined before initialize
	
	initialize: function ()
	{
		
	},
	
	setEventName: function (name)
	{
		this.owner.model.setState({name: name})
	}
}