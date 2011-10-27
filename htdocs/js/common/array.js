;(function(){

var prototype = Array.prototype

prototype.hashIndex = function ()
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++)
		hash[this[i]] = true
	return hash
}

prototype.hashIndexKey = function (key)
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++)
	{
		var v = this[i]
		hash[v[key]] = v
	}
	return hash
}

prototype.hashOfAryIndexBy = function (f)
{
	var hash = {}
	for (var i = 0, il = this.length; i < il; i++)
	{
		var v = this[i]
		
		var key = f(v)
		var ary = hash[key]
		if (ary)
			ary.push(v)
		else
			hash[key] = [v]
	}
	return hash
}

})();