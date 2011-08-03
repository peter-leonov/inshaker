
function onready (e)
{
	function click (e)
	{
		var target = e.target
		if (target.lazyLoaded)
			return
		
		var src = target.getAttribute('lazy-src')
		if (src)
		{
			target.src = src
			target.lazyLoaded = true
		}
	}
	
	document.addEventListener('mousemove', click, false)
}

document.addEventListener('ready', onready, false)