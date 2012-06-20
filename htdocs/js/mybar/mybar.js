;(function(){

var myName = 'MyBar',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind : function (nodes)
	{
		this.view.bind(nodes)
		this.model.bind()
		this.controller.bind()

		return this
	},

	setMainState : function()
	{
		this.model.setMainState()
	}
}

Object.extend(Me.prototype, myProto)

})();

<!--# include virtual="/liby/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/common/fun-fix.js" -->

<!--# include virtual="/js/common/autocompleter-3.js" -->
<!--# include virtual="/js/mybar/plain-input-autocompleter.js" -->

<!--# include virtual="/js/cocktails/ingredients-searcher.js" -->
<!--# include virtual="ingrediented-cocktail-list.js" -->

<!--# include virtual="suspending-rendering.js" -->
<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->

;(function(){

function onready ()
{
	UserAgent.setupDocumentElementClassNames()
	
	IngredientPopup.bootstrap()
	
	Ingredient.calculateEachIngredientUsage()
	
	var nodes = 
	{	
		mainBox : $('#common-main-wrapper .main-box'),
		mainFunFix: $('#the-main-menu'),
		mainFunFixLinks: $$('#the-main-menu .link'),
		
		mainLinksSup : {
			ingredients : $('#the-main-menu .ingredients .count'),
			cocktails : $('#the-main-menu .cocktails .count'),
			recommendations : $('#the-main-menu .recommendations .count')
		},
		
		ingredients : {
			box : $('#common-main-wrapper .ingredients-box'),
			title : {
				barName : $('#common-main-wrapper .ingredients-box .section-head h2 .bar-name-editable'),
				advice : $('#common-main-wrapper .ingredients-box .section-head h2 .advice')
			},
			list : $('#common-main-wrapper .ingredients-box .ingredients-list'),
			searchForm : $('#common-main-wrapper .ingredients-box .search-box form'),
			queryInput : $('#common-main-wrapper .ingredients-box .search-box form .query'),
			hint : $('#common-main-wrapper .ingredients-box .search-box .hint'),
			complete: $('#common-main-wrapper .ingredients-box .search-box .autocomplete'),
			luckyButton : $('#common-main-wrapper .ingredients-box .search-box .lucky-button'),
			switcher : $('#common-main-wrapper .ingredients-box .switcher'),
			links : $('#common-main-wrapper .ingredients-box .section-head .links'),
			empty : $('#common-main-wrapper .ingredients-box .empty-box')
		},
		
		maybeHave : {
			box : $('#common-main-wrapper .maybe-have-box'),
			list : $('#common-main-wrapper .maybe-have-box .ingredients-list')
		},
		
		cocktails : {
			box : $('#common-main-wrapper .cocktails-box'),
			wrapper : $('#common-main-wrapper .cocktails-box .cocktails-wrapper'),
			title : {
				h2 : $('#common-main-wrapper .cocktails-box .section-head h2'),
				plural : $('#common-main-wrapper .cocktails-box .section-head h2 .plural')
			},
			visible : $('#common-main-wrapper .cocktails-box .cocktails-wrapper .visible-cocktails'),
			hidden : $('#common-main-wrapper .cocktails-box .cocktails-wrapper .hidden-cocktails'),
			hiddenList : $('#common-main-wrapper .cocktails-box .cocktails-wrapper .hidden-cocktails .list'),
			switcher : $('#common-main-wrapper .cocktails-box .switcher'),
			links : $('#common-main-wrapper .cocktails-box .section-head .links'),
			empty : $('#common-main-wrapper .cocktails-box .empty-notice')
		},
		
		share : {
			box : $('#common-main-wrapper .share-box'),
			wrapper : $('#common-main-wrapper .share-box .share-wrapper'),
			popups : {
				email : {
					main : $('#common-main-wrapper .share-box .email-share-popup'),
					form : $('#common-main-wrapper .share-box .email-form'),
					text : $('#common-main-wrapper .share-box .email-share-popup textarea.message-body'),
					address : $('#common-main-wrapper .share-box .email-share-popup input.address'),
					mailer : $('#common-main-wrapper .share-box .email-share-popup input.mailer'),
					sendButton : $('#common-main-wrapper .share-box .email-share-popup .send-button'),
					emailSended : $('#common-main-wrapper .share-box .email-share-popup .email-sended')
				},
				web : {
					main : $('#common-main-wrapper .share-box .web-share-popup'),
					input : $('#common-main-wrapper .share-box .web-share-popup input')
				}
			},
			links : {
				vkontakte : $('#common-main-wrapper .share-box .share-wrapper .vkontakte-share'),
				facebook : $('#common-main-wrapper .share-box .share-wrapper .facebook-share'),
				twitter : $('#common-main-wrapper .share-box .share-wrapper .twitter-share')
			}
		},
		
		recommends : {
			box : $('#common-main-wrapper .recommends-box'),
			tags : $('#common-main-wrapper .recommends-box .tags-wrapper'),
			tagsList : $('#common-main-wrapper .recommends-box .tags-wrapper .tags-list'),
			wrapper : $('#common-main-wrapper .recommends-box .recommends-wrapper'),
			recommendsList : $('#common-main-wrapper .recommends-box .recommends-wrapper .recommends-list'),
			mustHaveList : $('#common-main-wrapper .recommends-box .recommends-wrapper .must-have-list')
			// upgradeRecommends : $('#common-main-wrapper .recommends-box .upgrade-recommends')
		}
	}

	var widget = new MyBar()
	widget.bind(nodes)
}

$.onready(onready)

})();
