if (/Firefox\/3\.5/.test(navigator.userAgent))
(function(){

if (self.console && self.console.log && self.console.error)
{
	if (!self.log)
		self.log = function () { self.console.log.apply(self.console, arguments) }

	if (!self.reportError)
		self.reportError = function () { self.console.error.apply(self.console, arguments) }
}
else
	self.log = self.reportError = function () {  }

if (!/привет/i.test("Привет"))
{
	RegExp.prototype.__pmc_test = RegExp.prototype.test
	RegExp.prototype.test = function (str) { return this.__pmc_test(this.ignoreCase ? String(str).toLowerCase() : str) }
}

})();



if (/Opera\//.test(navigator.userAgent))
(function(){

if (self.opera && opera.postError)
{
	if (!self.log)
		self.log = function () { return self.opera.postError(arguments) }

	if (!self.reportError)
		self.reportError = self.log
}
else
	self.log = self.reportError = function () {  }

})();



if (/WebKit\//.test(navigator.userAgent))
(function(){

if (self.console && self.console.log && self.console.error)
{
	if (!self.log)
		self.log = function () { return self.console.log(Array.prototype.slice.call(arguments).join(', ')) }

	if (!self.reportError)
		self.reportError = function () { return self.console.error(Array.prototype.slice.call(arguments).join(', ')) }
}
else
	self.log = self.reportError = function () {  }

var status = {}

document.addEventListener
(
	'keydown',
	function (e)
	{
		var target = e.target

		var ne = document.createEvent('Event')
		ne.initEvent('keypress', true, true)
		for (var k in e)
			ne[k] = e[k]

		if (status[e.keyCode])
			e.stopPropagation()
		else
			status[e.keyCode] = true

		if (!target.dispatchEvent(ne))
			e.preventDefault()
	},
	true
)

document.addEventListener
(
	'keyup',
	function (e)
	{
		delete status[e.keyCode]
	},
	true
)

})();
