// TODO: Wrap it in those cute objects like you did with other entities
var goods = <!--# include file="/db/goods.js" -->;

Good = function () {}

Object.extend(Good,
{
	initialize: function (db)
	{
		var anames = this.names = [],
			byName = this.byName = {},
			byMark = this.byMark = {}
		
		for (var k in db)
		{
			var good = db[k],
				names = good.names,
				mark = good.mark
			
			good.name = k
			
			if (names)
				for (var i = 0; i < names.length; i++)
				{
					var name = names[i]
					byName[name] = k
					anames.push(name)
				}
			
			if (mark)
			{
				var arr
				if ((arr = byMark[mark]))
					arr.push(good)
				else
					byMark[mark] = [good]
			}
		}
		
		this.db = db
	},
	
	getByMark: function (mark) { return this.byMark[mark] },
	
	ingredientsLinkByMark: function (mark)
	{
		var res = [], ingreds = this.getByMark(mark)
		for (var i = 0; i < ingreds.length; i++)
			res[i] = ingreds[i].name
		
		return "/cocktails.html#state=byIngredients&ingredients=" + encodeURIComponent(res.join(","))
	}
})

Good.initialize(goods)