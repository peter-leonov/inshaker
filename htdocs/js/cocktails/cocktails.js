// @requires Cocktail, Ingredient, Good

CocktailsPage =
{
	init: function (states, nodes, styles, cookies, decorationParams) {
		this.view       = new CocktailsView(states, nodes, styles, decorationParams)
		this.model      = new CocktailsModel(states, this.view)
		this.controller = new CocktailsController(states, cookies, this.model, this.view)
	}
}

$.onload(
	function () {
		var nodes = {
			resultsDisplay: $('results_display'),
			resultsRoot: $('surface'),
			pagerRoot: $('p-list'),
			
			bigNext: cssQuery(".pager-big .next")[0],
			bigPrev: cssQuery(".pager-big .prev")[0],
			
			alphabetRu: $('alphabetical-ru'),
			lettersAll: $('letters_all'),
			
			tagsList: $('tags_list'),
			strengthsList: $('strengths_list'),
			methodsList: $('methods_list'),
			
			searchByName: $('search_by_name'),
			searchByIngreds: $('search_by_ingreds'),
			searchByIngredsInput: cssQuery('#search_by_ingreds input')[0],
			searchByIngredsForm: cssQuery('#search_by_ingreds form')[0],
			searchByLetter: $('search_by_letter'),
			
			tagStrengthArea: $('b_search'),
			mainArea: $('b_content'),
			
			searchTabs: $('search_tabs'),
			ingredsView: cssQuery(".ingreds-list")[0],
			removeAllIngreds: cssQuery(".ingreds-list .rem")[0],
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
			disabled: 'dis',
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
		
		var decorationParams = <!--# include file="/db/decoration.js"-->
		
		CocktailsPage.init(states, nodes, styles, cookies, decorationParams)
		Calculator.init()
	}
)

Element.prototype.removeClassName = Element.prototype.remClassName

<!--# include file="/lib/Widgets/Switcher.js" -->
<!--# include file="/js/common/nodes-shortcut.js" -->
<!--# include file="/js/common/class.js" -->
<!--# include file="/js/common/mvc.js" -->
<!--# include file="/js/common/autocompleter.new.js" -->
<!--# include file="/js/cocktails/model.js" -->
<!--# include file="/js/cocktails/searcher.js" -->
<!--# include file="/js/cocktails/view.js" -->
<!--# include file="/js/cocktails/controller.js" -->
