<!--# include virtual="/liby/modules/json.js" -->
<!--# include virtual="/liby/modules/client-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/local-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/global-storage.js" -->
<!--# include virtual="/liby/modules/client-storage/user-data.js" -->
<!--# include virtual="/liby/modules/client-storage/flash-9.js" -->

var clientStorage = ClientStorage.guess()
if (!clientStorage)
	throw new Error('no client storge was found')

<!--# include virtual="/liby/modules/global-timer.js" -->
<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/cocktails/calculator/calculator.js" -->

<!--# include virtual="/js/common/units.js" -->
<!--# include virtual="/js/cocktails/dnd.js" -->
<!--# include virtual="/liby/modules/cookie.js" -->
