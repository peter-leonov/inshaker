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
		bodyWrapper: $$('#common-main-wrapper .column-main')[0],
		resultsDisplay: $('results_display'),
		resultsRoot: $('surface'),
		pagerRoot: $('p-list'),
		
		bigNext: $$(".pager-big .next")[0],
		bigPrev: $$(".pager-big .prev")[0],
		
		alphabetRu: $('alphabetical-ru'),
		lettersAll: $('letters_all'),
		
		tagsList: $('tags_list'),
		strengthsList: $('strengths_list'),
		methodsList: $('methods_list'),
		
		searchByName: $('search_by_name'),
		searchByNameInput: $$('#search_by_name input')[0],
		searchByLetter: $('search_by_letter'),
		searchByTags: $('search_by_tags'),
		
		mainArea: $('b_content'),
		
		tabsRoot: $$('#search_tabs')[0],
		tabs:
		{
			byName: $$('.by-name')[0],
			byLetter: $$('.by-letter')[0],
			top20: $$('.top-20')[0]
		},
		
		byLetterTab: $$('#search_tabs .by-letter')[0],
		
		searchExampleName: $('search_example_name'),
		searchExampleNameEng: $('search_example_name_eng'),
		searchTipName: $('search_tip_name'),
		
		panels: $('panels'),
		
		cartEmpty: $('cart_draghere'),
		cartFull: $('cart_contents'),
		
		spotlighted: $('spotlighted')
	}
	
	var widget = new CocktailsPage(nodes)
	widget.bind(nodes)
	
	Calculator.init()
	
	var nodes =
	{
		page: document.documentElement,
		holder: $('branded-image-holder')
	}
	
	var bs = new BrandingScroller()
	bs.bind(nodes)
}

$.onready(onready)

})();

<!--# include virtual="/liby/core/fixes/keydown-to-keypress.js"-->
<!--# include virtual="/liby/modules/regexp-escape.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/js/common/nodes-shortcut.js" -->
