// TODO: Wrap it in those cute objects like you did with other entities
var goods = <!--# include file="/db/goods.js" -->;

Good = function () {}

Object.extend(Good,
{
	initialize: function (db)
	{
		var anames = this.names = [],
			byName = this.byName = {}
		
		for (var k in db)
		{
			var good = db[k],
				names = good.names
				
			if (names)
				for (var i = 0; i < names.length; i++)
				{
					var name = names[i]
					byName[name] = k
					anames.push(name)
				}
		}
	}
})

Good.initialize(goods)