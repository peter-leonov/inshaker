EventPage.controller =
{
	owner: null, // must be defined before initialize
	
	initialize: function () {},
	
	setEventName: function (name)
	{
		this.owner.model.setState({name: name})
	},
	
	formPopupCloseClicked: function ()
	{
		this.owner.view.hideFormPopup()
	},
	
	formPopupOpenClicked: function ()
	{
		this.owner.view.showFormPopup()
	},
	
	checkTheForm: function (hash)
	{
		// for (var k in hash)
		// 	if (!/\S/.test(hash[k]))
		// 		return false
		
		return true
	},
	
	formOnCheck: function (hash, fields)
	{
		return this.checkTheForm(hash, fields)
	},
	
	formTimeCheck: function (hash, fields)
	{
		this.owner.view.setFormLock(!this.checkTheForm(hash, fields))
	},
	
	formSend: function ()
	{
		this.owner.view.stopFormChecker()
		this.owner.view.setFormLock(true)
	},
	
	formLoad: function ()
	{
		this.owner.view.setFormLock(false)
	},
	
	formSuccess: function (hash)
	{
		var view = this.owner.view
		view.showFormPopupThanks()
		view.resetForm()
		// setTimeout(function () { view.hideFormPopup() }, 10000)
	},
	
	formError: function (message)
	{
		reportError(message)
	},
	
	ratingShowAllClicked: function ()
	{
		this.owner.view.showAllRating()
	}
}
