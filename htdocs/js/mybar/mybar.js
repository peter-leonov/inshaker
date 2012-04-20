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

<!--# include virtual="/liby/core/fixes/keydown-to-keypress.js"-->

<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/liby/modules/regexp-escape.js" -->

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
		mainBox : $$('#common-main-wrapper .main-box')[0],
		mainFunFix: $('the-main-menu'),
		mainFunFixLinks: $$('#the-main-menu .link'),
		
		ingredients : {
			box : $$('#common-main-wrapper .ingredients-box')[0],
			title : {
				barName : $$('#common-main-wrapper .ingredients-box .section-head h2 .bar-name-editable')[0],
				advice : $$('#common-main-wrapper .ingredients-box .section-head h2 .advice')[0]
			},
			list : $$('#common-main-wrapper .ingredients-box .ingredients-list')[0],
			searchForm : $$('#common-main-wrapper .ingredients-box .search-box form')[0],
			queryInput : $$('#common-main-wrapper .ingredients-box .search-box form .query')[0],
			hint : $$('#common-main-wrapper .ingredients-box .search-box .hint')[0],
			complete: $$('#common-main-wrapper .ingredients-box .search-box .autocomplete')[0],
			luckyButton : $$('#common-main-wrapper .ingredients-box .search-box .lucky-button')[0],
			switcher : $$('#common-main-wrapper .ingredients-box .switcher')[0],
			links : $$('#common-main-wrapper .ingredients-box .section-head .links')[0],
			empty : $$('#common-main-wrapper .ingredients-box .empty-box')[0]
		},
		
		maybeHave : {
			box : $$('#common-main-wrapper .maybe-have-box')[0],
			list : $$('#common-main-wrapper .maybe-have-box .ingredients-list')[0]
		},
		
		cocktails : {
			box : $$('#common-main-wrapper .cocktails-box')[0],
			wrapper : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper')[0],
			title : {
				h2 : $$('#common-main-wrapper .cocktails-box .section-head h2')[0],
				plural : $$('#common-main-wrapper .cocktails-box .section-head h2 .plural')[0]
			},
			visible : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .visible-cocktails')[0],
			hidden : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .hidden-cocktails')[0],
			hiddenList : $$('#common-main-wrapper .cocktails-box .cocktails-wrapper .hidden-cocktails .list')[0],
			switcher : $$('#common-main-wrapper .cocktails-box .switcher')[0],
			links : $$('#common-main-wrapper .cocktails-box .section-head .links')[0],
			empty : $$('#common-main-wrapper .cocktails-box .empty-notice')[0]
		},
		
		share : {
			box : $$('#common-main-wrapper .share-box')[0],
			wrapper : $$('#common-main-wrapper .share-box .share-wrapper')[0],
			popups : {
				email : {
					main : $$('#common-main-wrapper .share-box .email-share-popup')[0],
					form : $$('#common-main-wrapper .share-box .email-form')[0],
					text : $$('#common-main-wrapper .share-box .email-share-popup textarea.message-body')[0],
					address : $$('#common-main-wrapper .share-box .email-share-popup input.address')[0],
					mailer : $$('#common-main-wrapper .share-box .email-share-popup input.mailer')[0],
					sendButton : $$('#common-main-wrapper .share-box .email-share-popup .send-button')[0],
					emailSended : $$('#common-main-wrapper .share-box .email-share-popup .email-sended')[0]
				},
				web : {
					main : $$('#common-main-wrapper .share-box .web-share-popup')[0],
					input : $$('#common-main-wrapper .share-box .web-share-popup input')[0]
				}
			},
			links : {
				vkontakte : $$('#common-main-wrapper .share-box .share-wrapper .vkontakte-share')[0],
				facebook : $$('#common-main-wrapper .share-box .share-wrapper .facebook-share')[0],
				twitter : $$('#common-main-wrapper .share-box .share-wrapper .twitter-share')[0]
			}
		},
		
		recommends : {
			box : $$('#common-main-wrapper .recommends-box')[0],
			tags : $$('#common-main-wrapper .recommends-box .tags-wrapper')[0],
			tagsList : $$('#common-main-wrapper .recommends-box .tags-wrapper .tags-list')[0],
			wrapper : $$('#common-main-wrapper .recommends-box .recommends-wrapper')[0],
			recommendsList : $$('#common-main-wrapper .recommends-box .recommends-wrapper .recommends-list')[0],
			mustHaveList : $$('#common-main-wrapper .recommends-box .recommends-wrapper .must-have-list')[0]/*,
						upgradeRecommends : $$('#common-main-wrapper .recommends-box .upgrade-recommends')[0]*/
		}
	}

	var widget = new MyBar()
	widget.bind(nodes)
}

$.onready(onready)

})();
