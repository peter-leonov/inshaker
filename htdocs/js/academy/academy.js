<!--# include virtual="/js/common/branding-scroller.js" -->


;(function(){

var Papa

;(function(){

function Me ()
{
	var m = this.model = new Me.Model(),
		v = this.view = new Me.View(),
		c = this.controller = new Me.Controller()
	
	m.view = v
	v.controller = c
	c.model = m
	
	m.parent = v.parent = c.parent = this
}

Me.prototype =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
		
		this.model.setState()
		
		this.view.bindBrandingScroller()
		
		return this
	}
}

Me.className = 'AcademyPage'
self[Me.className] = Papa = Me

})();


<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


})();



;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
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