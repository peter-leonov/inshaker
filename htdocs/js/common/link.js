/**
 * Переход по хэш-ссылкам, открытие поп-апов
 */
function Link () {}

Link.prototype.open = function(a)
{
    if (this.element) this.close()
	
	this.url = (a.constructor == String) ? a : a.href.split('#')[1]
	
	this._url(this.url)
	this.element = $(this.url)

	if (!this.element)
	{
		this.url = null
		return false;
	}

	//передаем параметр для кастамных открытий
	this.element.show()
}

Link.prototype.close = function()
{
	if (this.element)
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

Link.prototype._url = function (url) {}
