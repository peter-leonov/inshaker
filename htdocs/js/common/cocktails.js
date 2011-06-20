// deep copy using JSON lib ;-)
function cloneObject(obj){
	return JSON.parse(JSON.stringify(obj));
}

function lengthOf(obj){
	var length = 0;
	for(prop in obj) length++;
	return length;
}

Array.prototype.uniq = function(){
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(tmp.indexOf(this[i]) == -1) tmp.push(this[i]);
	}
	return tmp;
}

<!--# include virtual="/lib-0.3/modules/global-timer.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/lib-0.3/modules/child-indexed-path.js"-->
<!--# include virtual="/lib-0.3/modules/cloner.js"-->
<!--# include virtual="/js/common/popup.js" -->
<!--# include virtual="/js/common/ingredient-popup.js" -->

<!--# include virtual="/js/calculator/calculator.js" -->

<!--# include virtual="/js/common/good_helper.js" -->
<!--# include virtual="/js/common/datafilter.js" -->
<!--# include virtual="/js/common/dnd.js" -->
<!--# include virtual="/lib-0.3/modules/cookie.js" -->
<!--# include virtual="/js/common/rutils.js" -->
