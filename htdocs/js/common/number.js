;(function(){

var M = Math,
	round = M.round,
	ceil = M.ceil

var powersOfTen = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8]

Number.prototype.round = function (factor)
{
	if (factor)
	{
		factor = powersOfTen[factor]
		return round(this * factor) / factor
	}
	
	return round(this)
}

})();