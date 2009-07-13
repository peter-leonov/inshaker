/**
 * Math enhancements
 */
Math.roundPrecision = function($num, $precision) {
	if (isNaN($precision)) $precision = 0;
 	return Math.round(($num * Math.pow(10, $precision))) / Math.pow(10, $precision);
};

/**
 * String enhancements
 */
String.prototype.htmlName = function () {
	return this.toLowerCase().replace(/[^\w\-\.]/g, "_");
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
}

String.prototype.beforeTag = function() {
	var reg = new RegExp(/(.+)<.+>.*<\/.+>/);
	if(this.match(reg)) {
		return this.match(reg)[1]
	} else return this;
}

String.prototype.translify = function(){
	return RuTils.translify(this);
}

String.prototype.trans = function(){
	return RuTils.dirify(this);
}

Number.prototype.toFloatString = function(){
	if(this.toString() != parseInt(this)) return this.toString();
	return this + ".0";
}

Date.prototype.getFormatted = function(withYear){
	var weekdays = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"]
	var months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"] 
	return this.getDate() + " " + months[this.getMonth()] + (withYear ? " " + this.getFullYear() : ", " + weekdays[this.getDay()])
}

function spaces(num){
	var letters = (num + "").split("");
	var res = letters.splice(0, letters.length % 3).concat([" "]);
	while(letters.length > 0) {
		res = res.concat(letters.splice(0, 3));
		if(letters.length > 0) res = res.concat([" "]);
	}
	return res.join("");
}

function priceSpaces(num, symbol){
	if(num < 10000) return num;
	if(!symbol) symbol = " ";
	var letters = (num + "").split("");
	var res = letters.splice(0, letters.length % 3).concat([symbol]);
	while(letters.length > 0) {
		res = res.concat(letters.splice(0, 3));
		if(letters.length > 0) res = res.concat([symbol]);
	}
	return res.join("");
}

// deep copy using JSON-like lib ;-)
function cloneObject(obj){
	return Object.parse(Object.stringify(obj));
}

function lengthOf(obj){
	var length = 0;
	for(prop in obj) length++;
	return length;
}

/**
 * Array enhancements
 */
if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
    	for(var i = 0; i < this.length; i++){
        	if(this[i] == obj){
            	return i;
        	}
		}
		return -1;
	}
}


Array.prototype.uniq = function(){
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(tmp.indexOf(this[i]) == -1) tmp.push(this[i]);
	}
	return tmp;
}

Array.prototype.without = function(index) {
	var tmp = [];
	for(var i = 0; i < this.length; i++){
		if(i != index) tmp.push(this[i]);
	}
	return tmp;
}

Array.prototype.last = function(){
	return this[this.length-1];
}

Array.prototype.sortedBy = function(sortFunc) {
    return Array.copy(this).sort(sortFunc);
}

Array.prototype.shuffled = function() {
	var array = Array.copy(this);
	var tmp, current, top = array.length;
	
	if(top) while(--top) {
		current = Math.floor(Math.random() * (top + 1));
		tmp = array[current];
		array[current] = array[top];
		array[top] = tmp;
	}
	return array;
}

Array.prototype.random = function() {
	var len = this.length
	if (len)
		return this[Math.round(Math.random() * (len - 1))]
}


function toArray(hash) {
	var results = []
	for(var key in hash) results.push(hash[key])
	return results
}

function keyForValue(hash, value) {
  for(var key in hash) if(hash[key] == value) return key
  return null
}

function validateNumeric(txt){
	if(txt.match(/^\d+$/)) return true;
	return false;
};

function remClass(elem, className) { if(elem) elem.remClassName(className) };
function logObject(obj) { log(Object.stringify(obj))};

/**
 * Cookie functionality. 
 * All cookies are saved with "path=/"
 */
var Cookie = {
  set: function(name, value) {
    return (document.cookie = escape(name) + '=' + escape(value || '') + "; path=/");
  },

  get: function(name) {
    var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'));
    return (cookie ? unescape(cookie[2]) : null);
  },

  remove: function(name) {
    var cookie = Cookie.get(name) || true;
    Cookie.set(name, '', -1);
    return cookie;
  },
  
  getKeys: function(){
	var res = [];
	var arr = document.cookie.match(/(\w+)=[\w\d\S]*;*/ig);
	for(var i = 0; i < arr.length; i++){
		res.push(arr[i].split("=")[0])
	}
	return res;
  },
  
  clear: function(){
	var keys = Cookie.getKeys();
	for(var i = 0; i < keys.length; i++) Cookie.remove(keys[i]); 
  }
};

// ported from rutils.rb
;(function(){

var LOWER =
{
	"і":"i","ґ":"g","ё":"yo","№":"#","є":"e",
	"ї":"yi","а":"a","б":"b",
	"в":"v","г":"g","д":"d","е":"e","ж":"zh",
	"з":"z","и":"i","й":"y","к":"k","л":"l",
	"м":"m","н":"n","о":"o","п":"p","р":"r",
	"с":"s","т":"t","у":"u","ф":"f","х":"h",
	"ц":"ts","ч":"ch","ш":"sh","щ":"sch","ъ":"'",
	"ы":"yi","ь":"","э":"e","ю":"yu","я":"ya"
}

var UPPER =
{
	"Ґ":"G","Ё":"YO","Є":"E","Ї":"YI","І":"I",
	"А":"A","Б":"B","В":"V","Г":"G",
	"Д":"D","Е":"E","Ж":"ZH","З":"Z","И":"I",
	"Й":"Y","К":"K","Л":"L","М":"M","Н":"N",
	"О":"O","П":"P","Р":"R","С":"S","Т":"T",
	"У":"U","Ф":"F","Х":"H","Ц":"TS","Ч":"CH",
	"Ш":"SH","Щ":"SCH","Ъ":"'","Ы":"YI","Ь":"",
	"Э":"E","Ю":"YU","Я":"YA"
}

var undef

self.RuTils = 
{
	// Заменяет кириллицу в строке на латиницу. Немного специфично потому что поддерживает
	// комби-регистр (Щука -> Shuka)
	translify: function (str)
	{
		var res = []
		
		for (var i = 0; i < str.length; i++)
		{
			var c = str.charAt(i), r
			
			if ((r = UPPER[c]) !== undef)
			{
				if (LOWER[str.charAt(i+1)] !== undef)
					r = r.toLowerCase().capitalize()
			}
			else
			{
				r = LOWER[c]
				if (r === undef)
					r = c
			}
			
			res[i] = r
		}
		
		return res.join('')
	},
	
	dirify: function (s)
	{
		return s.translify()
				.replace(/(\s&\s)|(\s&amp;\s)/g, ' and ')
				.replace(/\W/g, ' ')
				.replace(/^_+|_+$/g, '')
				.replace(/^\s+|\s+$/g, '') // trim
				.translify() // yes, second
				.replace(/[\s\-]+/g, '-')
				.toLowerCase()
	}
}

// log("Щука".trans() == 'schuka')
// log("апельсиновый сок".trans() == 'apelsinovyiy-sok')

})();


/**
 * Переход по хэш-ссылкам, открытие поп-апов
 */
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
	{
		this.url = null
		return false;
	}

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

function checkDbRevision(){
	if(Cookie.get("db_revision") == db.revision) return true;
	else {
		Cookie.set("db_revision", db.revision);
		return false;
	}
}

/**
 * This function merges nodes from parentNode with nodes given in nodesArray.
 * It deletes nodes those aren't in nodesArray, appends noes those are'n in parentNode
 * and doesn't touch nodes those are in both parentNode and nodesArray
 * @param parentNode - destination node for merging result
 * @param nodesArray - new state of parentNode that could be made
 */

function mergeNodes(parentNode, nodesArray)
{
	for (var i = 0; i < nodesArray.length; i++)
		if (nodesArray[i].parentNode != parentNode)
			parentNode.appendChild(nodesArray[i]);
	
	var childs = Array.copy(parentNode.childNodes);
	for (var i = 0, il = childs.length; i < il; i++)
	{
		var node = childs[i]
		if (node && nodesArray.indexOf(node) < 0)
			parentNode.removeChild(node)
	}
}

function mergeIngredientsNodes(parentNode, nodesArray)
{
    var presentIngreds = cssQuery("li", parentNode).map(function(e){ return [e, Ingredient.getByName(e.getElementsByTagName("input")[1].value)]})
    
    for (var i = 0; i < nodesArray.length; i++)
		if (nodesArray[i].parentNode != parentNode)
		    insertChild(presentIngreds, parentNode, nodesArray[i]);
	
	var childs = Array.copy(parentNode.childNodes);
	for (var i = 0, il = childs.length; i < il; i++)
	{
		var node = childs[i]
		if (node && nodesArray.indexOf(node) < 0)
			parentNode.removeChild(node)
	}
}

function insertChild(presentIngreds, parentNode, node)
{
    var insertedIngredient = Ingredient.getByName(node.getElementsByTagName("input")[1].value)
    var closestGap = Infinity
    var closestNode = null
    var sGap = null // signed

    for(var i = 0; i < presentIngreds.length; i++)
    {
        sGap = presentIngreds[i][1].listOrder() - insertedIngredient.listOrder()
        var gap = Math.abs(sGap)
        if(gap < closestGap)
        {
            closestGap = gap
            closestNode = presentIngreds[i][0] 
        }
    }
    if(sGap < 0) parentNode.insertBefore(node, closestNode)
    else if(closestNode) insertAfter(node, closestNode)
    else parentNode.appendChild(node)
}

function insertAfter(new_node, existing_node) 
{
    if (existing_node.nextSibling) 
        existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling)
    else existing_node.parentNode.appendChild(new_node)
}

/**
 * Get element's absolute position
 * 
 * @param e - element
 * @return {Object} position - x,y
 */
function getPosition(e){
	var left = 0;
	var top  = 0;

	while (e.offsetParent){
		left += e.offsetLeft;
		top  += e.offsetTop;
		e     = e.offsetParent;
	}

	left += e.offsetLeft;
	top  += e.offsetTop;

	return {x: left, y:top};
};
