var findCheapestPrice = function(v, ingredientVolumes)
{
	var arr = []
	var minPrice = Infinity
	
	appendBottles(0, 0, 0, [])
	
	function appendBottles(currentVolume, currentPrice, start, bottles)
	{
		for (var i = start, il = ingredientVolumes.length; i < il; i++) 
		{
			var volumeObj = ingredientVolumes[i]
			var tprice = currentPrice + volumeObj[1]
			if(tprice < minPrice)
			{
				var currBottles = bottles.slice()
				currBottles.push(volumeObj)
				var tvol = currentVolume + volumeObj[0]
				
				
				if(tvol < v)
				{
					appendBottles(tvol, tprice, i, currBottles)
				}
				else
				{
					arr.push({ bottles : currBottles, minPrice : tprice})
						minPrice = tprice
				}
			}
		}
	}
	
	return arr
}

var arr = [[3, 4], [2, 3], [1, 2]]

arr.map(function(a){ a.push(Math.round(a[1]/a[0])) })
arr.sort(function(a, b){ return a[2] - b[2] })

var res = findCheapestPrice(20, [[3, 4], [2, 3], [1, 2]])

console.log(res)

var minPrice = Infinity
var t = 0

for (var i = 0, il = res.length; i < il; i++) 
{
	var mp = res[i].minPrice
	if(mp < minPrice)
	{
		minPrice = mp
		t = i
	}	
}

console.log(res[t])

