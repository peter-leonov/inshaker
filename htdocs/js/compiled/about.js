<!--# include file="/lib/Programica/Request.js" -->
<!--# include file="/lib/Programica/Form.js" -->

<!--# include file="/lib/Programica/Widget.js" -->
<!--# include file="/lib/Widgets/FormPoster.js" -->
<!--# include file="/lib/Widgets/RollingImagesLite.js" -->

<!--# include file="/js/about/about.js" -->
<!--# include file="/lib/swfobject.js" -->

$.onload(function(){
	About.init();
	new Programica.RollingImagesLite($('rolling_stats'), {animationType: 'directJump'});
})