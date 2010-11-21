;(function(){

var Papa

;(function(){

var myName = 'AcademyPage',
	Me = Papa = self[myName] = MVC.create(myName)

// Me.mixIn(EventDriven)

var myProto =
{
	initialize: function ()
	{
		this.model.initialize()
		this.view.initialize()
		this.controller.initialize()
	},

	bind: function (nodes, sources, state)
	{
		this.model.bind(sources)
		this.view.bind(nodes)
		
		return this
	}
}

Object.extend(Me.prototype, myProto)

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();


;(function(){

function onready ()
{
	var nodes =
	{
		page: $('academy-page'),
		brandedImageHolder: $('branded-image-holder')
	}
	
	var widget = new AcademyPage()
	widget.bind(nodes)
}

$.onready(onready)

})();