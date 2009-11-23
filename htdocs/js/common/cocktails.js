// deep copy using JSON-like lib ;-)
function cloneObject(obj){
	return Object.parse(Object.stringify(obj));
}

function lengthOf(obj){
	var length = 0;
	for(prop in obj) length++;
	return length;
}

function copyProperties(obj, propsList){
    var ret = {};
    for(var i = 0; i < propsList.length; i++){
        ret[propsList[i]] = obj[propsList[i]];
    }
    return ret;
}

Array.prototype.uniq = function(){
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(tmp.indexOf(this[i]) == -1) tmp.push(this[i]);
	}
	return tmp;
}


<!--# include file="/js/common/good_helper.js" -->
<!--# include file="/js/common/datafilter.js" -->
<!--# include file="/js/common/storage.js" -->
<!--# include file="/js/common/dnd.js" -->
<!--# include file="/js/common/cookie.js" -->
<!--# include file="/js/common/link.js" -->
<!--# include file="/js/common/theme.js" -->

<!--# include file="/js/calculator/model.js" -->
<!--# include file="/js/calculator/view.js" -->
<!--# include file="/js/calculator/controller.js" -->
<!--# include file="/js/calculator/calculator.js" -->

