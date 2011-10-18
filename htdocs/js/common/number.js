;(function(){

Number.prototype.round = function (factor)
{
	if (factor)
	{
		factor = Math.pow(10, factor)
		return Math.round(this * factor) / factor
	}
	
	return Math.round(this)
}

})();