// @requires Cocktail, Ingredient, Good

CocktailsPage =
{
	init: function (states, nodes, styles, cookies) {
		this.view       = new CocktailsView(states, nodes, styles)
		this.model      = new CocktailsModel(states, this.view)
		this.controller = new CocktailsController(states, cookies, this.model, this.view)
	}
}

$.onready(
	function () {
		UserAgent.setupDocumentElementClassNames()
		IngredientPopup.bootstrap()
		
		var nodes = {
			bodyWrapper: $$('#main-wrapper .body-wrapper')[0],
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
			searchByIngreds: $('search_by_ingreds'),
			searchByIngredsInput: $$('#search_by_ingreds input')[0],
			searchByIngredsForm: $$('#search_by_ingreds form')[0],
			searchByLetter: $('search_by_letter'),
			
			tagStrengthArea: $('b_search'),
			mainArea: $('b_content'),
			
			searchTabs: $('search_tabs'),
			ingredsView: $$(".ingreds-list")[0],
			removeAllIngreds: $$(".ingreds-list .rem")[0],
			searchesList: $('ingredients_list'),
			searchTips: $('search_tips'),
			
			ingredientsLink: $('all_list'),
			
			searchExampleIngredient: $('search_example_ingredient'),
			searchTipIngredient: $('search_tip_ingredient'),
			
			searchExampleName: $('search_example_name'),
			searchExampleNameEng: $('search_example_name_eng'),
			searchTipName: $('search_tip_name'),
			
			cartEmpty: $('cart_draghere'),
			cartFull: $('cart_contents'),
			
			spotlighted: $('spotlighted')
		}
		
		var styles = {
			selected: 'selected-button',
			disabled: 'disabled',
			point: 'point'
		}
		
		var cookies = {
			filter: 'filters',
			force: 'force',
			
			strengthState: 'strength_state',
			tagState: 'tag_state',
			methodState: 'method_state'
		}
		
		var states = {
			byName:        0,
			byLetter:      1,
			byIngredients: 2,
			
			defaultState:  0
		}
		
		CocktailsPage.init(states, nodes, styles, cookies)
		Calculator.init()
	}
)

<!--# include virtual="/lib-0.3/core/fixes/keydown-to-keypress.js"-->
<!--# include virtual="/lib-0.3/modules/regexp-escape.js" -->
<!--# include virtual="/js/common/switcher.js" -->
<!--# include virtual="/js/common/nodes-shortcut.js" -->
<!--# include virtual="/js/common/mvc.js" -->
<!--# include virtual="/js/common/autocompleter-2.js" -->
<!--# include virtual="/js/cocktails/model.js" -->
<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->
<!--# include virtual="/js/cocktails/view.js" -->
<!--# include virtual="/js/cocktails/controller.js" -->
