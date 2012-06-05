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
		
		this.view.checkRequest()
		
		return this
	}
}

Me.className = 'CocktailsPage'
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
	IngredientPopup.bootstrap()
	
	var nodes =
	{
		bodyWrapper: $('#common-main-wrapper .column-main'),
		resultsDisplay: $('#results_display'),
		resultsRoot: $('#surface'),
		pagerRoot: $('#p-list'),
		
		bigNext: $(".pager-big .next"),
		bigPrev: $(".pager-big .prev"),
		
		alphabetRu: $('#alphabetical-ru'),
		lettersAll: $('#letters_all'),
		
		searchByName: $('#search_by_name'),
		searchByNameInput: $('#search_by_name input'),
		searchByLetter: $('#search_by_letter'),
		
		mainArea: $('#b_content'),
		
		tabsRoot: $('#search_tabs'),
		tabs:
		{
			byName: $('.by-name'),
			byLetter: $('.by-letter'),
			top20: $('.top-20')
		},
		
		byLetterTab: $('#search_tabs .by-letter'),
		
		searchExampleName: $('#search_example_name'),
		searchExampleNameEng: $('#search_example_name_eng'),
		searchTipName: $('#search_tip_name'),
		
		panels: $('#panels'),
		
		cartEmpty: $('#cart_draghere'),
		cartFull: $('#cart_contents'),
		
		spotlighted: $('#spotlighted')
	}
	
	var widget = new CocktailsPage(nodes)
	widget.bind(nodes)
	
	Calculator.init()
	
	var nodes =
	{
		page: document.documentElement,
		holder: $('#branded-image-holder')
	}
	
	var bs = new BrandingScroller()
	bs.bind(nodes)
}

$.onready(onready)

})();

<!--# include virtual="/liby/fixes/keydown-to-keypress.js"-->
<!--# include virtual="/js/common/nodes-shortcut.js" -->
