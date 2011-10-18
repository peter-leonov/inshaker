;(function(){

var M = Math,
	round = M.round,
	ceil = M.ceil,
	floor = M.floor

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

Number.prototype.floor = function (factor)
{
	if (factor)
	{
		return floor(this * factor) / factor
	}
	
	return floor(this)
}

})();