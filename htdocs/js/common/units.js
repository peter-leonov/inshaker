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

var litre =
[
	[0, 1,     1000, 'мл'],
	[1, 1000,  1,    'л']
]

var gramme =
[
	[0,       1000,       1,        'г'],
	[1000,    1000000,    0.001,    'кг'],
	[1000000, 1000000000, 0.000001, 'т']
]

var humans =
{
	'л': litre,
	'г': gramme
}


var Me =
{
	humanizeDose: function (vol, unit)
	{
		var h = humans[unit]
		if (!h)
			return [vol, unit, 1]
		
		for (var i = 0, il = h.length; i < il; i++)
		{
			var scale = h[i],
				k = scale[2]
			
			if (scale[0] <= vol && vol < scale[1])
				return [vol * k, scale[3], k]
		}
		
		return [vol, unit, 1]
	}
}

Me.className = 'Units'
self[Me.className] = Me

})();