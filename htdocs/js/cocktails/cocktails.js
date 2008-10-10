// @requires Cocktail, Ingredient, Good

CocktailsPage =
{	
	init: function (states, nodes, styles, cookies) {
		this.view       = new CocktailsView(states, nodes, styles);
		this.model      = new CocktailsModel(states, this.view);
		this.controller = new CocktailsController(this.model, this.view, cookies);
	}
}

$.onload (
	function () {
		var nodes = {
			preloader: $('preloader'),
			resultsDisplay: $('results_display'),
			resultsRoot: $('surface'),
			pagerRoot: $('p-list'),
			
      bigNext: cssQuery(".pager-big .next")[0],
      bigPrev: cssQuery(".pager-big .prev")[0],

			alphabetRu: $('alphabetical-ru'),
			lettersAll: $('letters_all'),
			
			tagsList: $('tags_list'),
			strengthsList: $('strengths_list'),

			searchByName: $('search_by_name'),
			searchByIngreds: $('search_by_ingreds'),
			searchByLetter: $('search_by_letter'),
			
			tagStrengthArea: $('b_search'),
			mainArea: $('b_content'),
			
			searchTabs: $('search_tabs'),
      ingredsView: cssQuery(".ingreds-list")[0],
			removeAllIngreds: cssQuery(".ingreds-list .rem")[0],
      searchesList: $('ingredients_list'),
			
			ingredientsLink: $('all_list'),
			
			searchExampleIngredient: $('search_example_ingredient'),
			searchTipIngredient: $('search_tip_ingredient'),
			
			searchExampleName: $('search_example_name'),
			searchExampleNameEng: $('search_example_name_eng'),
			searchTipName: $('search_tip_name'),

      searchTipLetter: $('search_tip_letter'),

			cartEmpty: $('cart_draghere'),
			cartFull: $('cart_contents')
		};
		
		var styles = {
			selected: 'selected-button',
			disabled: 'dis',
			expanded: 'expanded',
			point: 'point'
		};
		
		var cookies = {
			filter: 'filters',
			force: 'force',
			
			strengthState: 'strength_state',
		    tagState: 'tag_state'
		};
		
		var states = {
			byName:        0,
			byLetter:      1,
			byIngredients: 2,
			defaultState: this.byName
		};
		
		CocktailsPage.init(states,nodes, styles, cookies);
		Calculator.init();
	}
)

<!--# include file="/lib/Widgets/Switcher.js" -->
<!--# include file="/js/common/autocompleter.js" -->
<!--# include file="/js/cocktails/model.js" -->
<!--# include file="/js/cocktails/view.js" -->
<!--# include file="/js/cocktails/controller.js" -->
