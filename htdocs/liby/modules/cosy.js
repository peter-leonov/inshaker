;(function(){

window.$$ = function (query, root)
{
	var list = (root || document).querySelectorAll(query)
	return Array.from(list)
}
window.$ = function (query, root)
{
	return (root || document).querySelector(query)
}

$.id = function (id) { return document.getElementById(id) }

$.onload = function (f) { return window.addEventListener('load', f, false) }
$.onready = function (f) { document.addEventListener('DOMContentLoaded', f, false) }
$.load = function (src)
{
  var script = document.createElement('script')
  script.src = src
  document.getElementsByTagName('head')[0].appendChild(script)
  return script
}

$.require = function (src)
{
	var r = new XMLHttpRequest()
	r.open('GET', src, false)
	r.onreadystatechange = function ()
	{
		if (this.readyState != 4)
			return
		
		var script = document.createElement('script')
		document.body.appendChild(script)
		script.text = this.responseText
	}
	r.send(null)
}

})();
