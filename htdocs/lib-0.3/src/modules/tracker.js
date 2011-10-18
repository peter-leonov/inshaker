;(function(){

var myName = 'Tracker',
	escape = window.encodeURIComponent || window.escape

var Me =
{
	version: 0.3,
	reportPath: '/tracker/report',
	session: +new Date() + '-' + Math.round(Math.random() * 1E+17),
	
	event: function (category, action, label, value)
	{
		try
		{
			var q =
				'vr=' + escape(this.version) +
				'&s=' + escape(this.session) +
				'&c=' + escape(category) +
				'&a=' + escape(action) +
				'&l=' + escape(label) +
				'&v=' + escape(value)
			
			this.send(q)
			
			return true
		}
		catch (ex)
		{
			this.log('could not report an event')
		}
	},
	
	send: function (data)
	{
		var r = new Image(1, 1)
		r.src = this.reportPath + '?' + data
	},
	
	log: function (str) { try { console.log(myName + ': ' + str) } catch (ex) {} }
}

self.className = Me
self[myName] = Me

})();