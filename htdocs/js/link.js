function Link()
{
	if(location.hash)
		this.open(location.hash.substr(1))
}

Link.prototype.open = function(a)
{
	if (this.element)
		this.close()

	this.url = (a.constructor == String) ? a : a.href.split('#')[1]
	
	this._url(this.url)
	this.element	= $(this.url)

	if (!this.element)
		return false;

	//передаем параметр для кастамных открытий
	this.element.show()
}

Link.prototype.close = function()
{
	this.element.hide()
	this.element = null
	this._url('main')
}
// Переход в другое окно
Link.prototype.go = function(a)
{
	this.url = (a.constructor == String) ? a : a.href.split('#')[1]
	
	// Передача параметра, если захотим переопределить hide() элемента, и построить за счет него логику
	this.element.hide(this.url)
	this.element = null

	this._url(this.url)
	this.element = $(this.url)

	if (!this.element)
		return false;

	this.element.show()
}

Link.prototype._url = function (url)
{
	//if(safari)
	//{
	//	var x = document.getElementById('safari') || document.createElement('form');
	//	x.id = 'safari';
	//	x.action = '#' + url;
	//	x.submit();
	//}
	//else
	//{
		window.location.hash = '#'+url
	//}
}
