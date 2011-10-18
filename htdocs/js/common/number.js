;(function(){

var M = Math,
	pow = M.pow,
	round = M.round,
	ceil = M.ceil

Number.prototype.round = function (factor)
{
	if (factor)
	{
		factor = pow(10, factor)
		return round(this * factor) / factor
	}
	
	return round(this)
}

})();