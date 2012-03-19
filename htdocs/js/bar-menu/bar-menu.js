;(function(){

var myName = 'BarMenu',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()
	},
	
	setMainState : function()
	{
		this.model.setMainState()
		return this
	}
	
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/liby/modules/json.js" -->
<!--# include virtual="/liby/modules/user-agent.js" -->

<!--# include virtual="/js/common/bar-storage.js" -->
<!--# include virtual="/js/common/mybar-name.js" -->

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->


;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	document.documentElement.removeClassName('loading')
	var nodes = {
		barName : {
			wrapper : $('bar-name'),
			tip : $$('#bar-name .tip')[0],
			title : $$('#bar-name h2')[0],
			help : $$('#bar-name h2 .help')[0],
			bName : $$('#bar-name h2 .name')[0],
			form : $$('#bar-name .change-name')[0],
			input : $$('#bar-name .change-name .new-bar-name')[0]
		},
		
		barMenu : {
			wrapper : $$('#output .b-content .menu-block .wrapper')[0],
			empty : $$('#output .b-content .empty-menu')[0]
		}
		/*,
			
		ingredients : {
			main : $$('#output .b-content .ingredients-block')[0],
			wrapper : $$('#output .b-content .ingredients-block .wrapper')[0]
		}*/
		
	}
	
	var widget = new BarMenu()
	widget.bind(nodes)
}

$.onready(onready)

})();