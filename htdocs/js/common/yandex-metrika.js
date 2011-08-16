;(function(){

(function(w, c) {
	(w[c] = w[c] || []).push(function() {
		try {
			w.yaCounter4360057 = new Ya.Metrika({id:4360057,
				clickmap:true,
				trackLinks:true,
				accurateTrackBounce:true});
		}
		catch(e) { }
	});
})(window, 'yandex_metrika_callbacks');


var Me =
{
	trackPageview: function ()
	{
		$.load('//mc.yandex.ru/metrika/watch_visor.js')
	}
}

Me.className = 'YandexMetrika'
self[Me.className] = Me

})();
