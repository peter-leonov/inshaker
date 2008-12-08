<!--# include file="/lib/base2/cssQuery.js" -->
<!--# include file="/js/common/programica.js" -->

<!--# include file="/js/common/util.js" -->
<!--# include file="/js/common/storage.js" -->
<!--# include file="/js/common/dnd.js" -->
<!--# include file="/js/common/good_helper.js" -->
<!--# include file="/js/common/datafilter.js" -->
<!--# include file="/js/common/maps.js" -->

<!--# include file="/js/calculator/model.js" -->
<!--# include file="/js/calculator/view.js" -->
<!--# include file="/js/calculator/controller.js" -->
<!--# include file="/js/calculator/calculator.js" -->

$.onload(function () { setTimeout(function () { $.include('/js/common/analytics.js') }, 1200) })
$.onload(function () { setTimeout(function () {
	var href = String(window.menuItem || location.pathname.split(/#/)[0]);
	if (href != "/")
		cssQuery('#top .nav a').forEach(function (v) { if (String(v.pathname).indexOf(href) > -1) { v.addClassName('now') } });
}) })
