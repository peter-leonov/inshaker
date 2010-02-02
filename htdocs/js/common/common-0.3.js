<!--# include file="/js/common/programica-0.3.js" -->
<!--# include file="/js/common/cocktail-list.js" -->
<!--# include file="/js/common/analytics.js" -->

String.prototype.htmlName = function () { return this.replace(/[^\w\-\.]/g, "_").toLowerCase() }