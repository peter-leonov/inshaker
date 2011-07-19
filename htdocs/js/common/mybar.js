<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/client-storage.js" -->
<!--# include virtual="/lib-0.3/modules/client-storage/local-storage.js" -->
<!--# include virtual="/lib-0.3/modules/client-storage/global-storage.js" -->
<!--# include virtual="/lib-0.3/modules/client-storage/user-data.js" -->
<!--# include virtual="/lib-0.3/modules/client-storage/flash-9.js" -->

var clientStorage = ClientStorage.guess()
if (!clientStorage)
	throw new Error('no client storge was found')

<!--# include virtual="/lib-0.3/modules/url-encode.js"-->
<!--# include virtual="/lib-0.3/modules/request.js"-->
<!--# include virtual="/js/common/bar-storage.js" -->
<!--# include virtual="/js/common/mybar-button.js" -->
