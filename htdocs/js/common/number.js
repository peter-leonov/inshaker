;(function(){

var M = Math,
	round = M.round,
	ceil = M.ceil

Number.prototype.round = function (factor)
{
	if (factor)
	{
		return round(this * factor) / factor
	}
	
	return round(this)
}

Number.prototype.ceil = function (factor)
{
	if (factor)
	{
		return ceil(this * factor) / factor
	}
	
	return ceil(this)
}

})();