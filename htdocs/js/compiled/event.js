window.addEventListener('keypress', function (e) { if (e.charCode == 109) $('model').toggle() }, false)

$.onload
(
	function ()
	{
		cssQuery('.programica-rolling-images').forEach(function (v) { new Programica.RollingImagesLite(v, {animationType: 'easeOutQuad'}) })
	}
)