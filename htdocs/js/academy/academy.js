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
		this.view.bind(nodes)
		
		this.model.setState()
		
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
	RoundedCorners.init()
	
	var nodes =
	{
		page: $('academy-page'),
		brandedImageHolder: $('branded-image-holder'),
		videoBlocks: $('video-blocks')
	}
	
	var widget = new AcademyPage()
	widget.bind(nodes)
}

$.onready(onready)

})();