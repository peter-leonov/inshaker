// @requires Cocktail, Ingredient, Good

CocktailsPage =
{
	init: function (nodes, styles, cookies) {
		this.view       = new CocktailsView(nodes, styles);
		this.model      = new CocktailsModel(this.view);
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
			
			alphabetRu: $('alphabetical-ru'),
			lettersAll: $('letters_all'),
			
			tagsList: $('tags_list'),
			strengthsList: $('strengths_list'),

			searchesList: $('ingredients_list'),
			searchExample: $('search_example'),

			cartEmpty: $('cart_draghere'),
			cartFull: $('cart_contents')
		};
		
		var styles = {
			selected: 'selected-button',
			disabled: 'dis'
		};
		
		var cookies = {
			filter: 'filters',
			force: 'force',
			
			strengthState: 'strength_state',
		    tagState: 'tag_state'
		};
		CocktailsPage.init(nodes, styles, cookies);
		Calculator.init();
	}
)

<!--# include file="/js/common/autocompleter.js" -->
<!--# include file="/js/cocktails/model.js" -->
<!--# include file="/js/cocktails/view.js" -->
<!--# include file="/js/cocktails/controller.js" -->