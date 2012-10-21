;(function(){

eval(NodesShortcut.include())

var Me =
{
	initialize: function (data)
	{
		this.data = data
		this.files = {}
		this.index = {}
	},

	indexedErrors: function ()
	{
		var data = this.data,
			groups = {},
			groupsArr = []

		var total = data.pop().total.uniqueEvents

		for (var i = 0, il = data.length; i < il; i++)
		{
			var msg = data[i][0],
				tmp2 = msg.split(' at '),
				type = tmp2[0],
				fileWithLine = tmp2[1],
				tmp = fileWithLine.split(':'),
				file = tmp[0],
				line = tmp[1]

			if (!file || !file.indexOf('/') == 0)
				continue

			if (file.split('.').pop() == "html")
				continue

			var error =
			{
				file: file,
				line: line,
				browsers: [[data[i][1], data[i][2]]],
				uniqueEvents: data[i][3],
				eventVale: data[i][4]
			}

			if (!groups[type])
			{
				var group =
				{
					type: type,
					errors: [],
					sumUniqueEvents: 0
				}
				var index = groupsArr.push(group) - 1
				groups[type] = index
			}

			var index = groups[type],
				errors = groupsArr[index].errors

			if (error != 0)
				errors.push(error)

			groupsArr[index].sumUniqueEvents += data[i][3]
		}

		this.groups = groupsArr.sort(function(a, b){ return b.sumUniqueEvents - a.sumUniqueEvents })
	},
}

Me.className = 'TopErrors'
self[Me.className] = Me

Me.initialize(<!--# include virtual="/db/stats/errors.json" -->)

})();