/**
 * Math enhancements
 */
Math._round = Math.round;
Math.round = function($num, $precision) {
	if (isNaN($precision)) $precision = 0;
 	return Math._round(($num * Math.pow(10, $precision))) / Math.pow(10, $precision);
};

/**
 * String enhancements
 */
String.prototype.htmlName = function () {
	return this.toLowerCase().replace(/ /g, "_");
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

String.prototype.trans = function(){
	return BiDiTranslit(this, false, true).replace(/\+/g, "");
}

Number.prototype.toFloatString = function(){
	if(this.toString() != parseInt(this)) return this.toString();
	return this + ".0";
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

// deep copy using JSON lib ;-)
function cloneObject(obj){
	return JSON.parse(JSON.stringify(obj));
}

function lengthOf(obj){
	var length = 0;
	for(prop in obj) length++;
	return length;
}

/**
 * Array enhancements
 */
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

function toArray(hash) {
	var results = [];
	for(key in hash) results.push(hash[key]);
	return results;
}

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

  erase: function(name) {
    var cookie = Cookie.get(name) || true;
    Cookie.set(name, '', -1);
    return cookie;
  },

  accept: function() {
    if (typeof navigator.cookieEnabled == 'boolean') {
      return navigator.cookieEnabled;
    }
    Cookie.set('_test', '1');
    return (Cookie.erase('_test') = '1');
  }
};

/**
 * Translit JS class.
 * @version 1.2
 * @date 12 November 2005
 * @author Mendokusee@pixeapes
 */
function BiDiTranslit( str, direction_decode, allow_slashes )
{
   var Tran = {
    "А" : "A",  "Б" : "B",  "В" : "V",  "Г" : "G",  "Д" : "D",  "Е" : "E",  "Ё" : "JO",  "Ж" : "ZH",  "З" : "Z",  "И" : "I",
    "Й" : "JJ", "К" : "K",  "Л" : "L",  "М" : "M",  "Н" : "N",  "О" : "O",  "П" : "P",   "Р" : "R",   "С" : "S",  "Т" : "T",
    "У" : "U",  "Ф" : "F",  "Х" : "KH",  "Ц" : "C",  "Ч" : "CH", "Ш" : "SH", "Щ" : "SHH", "Ъ" : "_~",   "Ы" : "Y",  "Ь" : "_'",
    "Э" : "EH", "Ю" : "JU", "Я" : "JA", "а" : "a",  "б" : "b",  "в" : "v",  "г" : "g",   "д" : "d",   "е" : "e",  "ё" : "jo",
    "ж" : "zh", "з" : "z",  "и" : "i",  "й" : "jj", "к" : "k",  "л" : "l",  "м" : "m",   "н" : "n",   "о" : "o",  "п" : "p",
    "р" : "r",  "с" : "s",  "т" : "t",  "у" : "u",  "ф" : "f",  "х" : "kh",  "ц" : "c",   "ч" : "ch",  "ш" : "sh", "щ" : "shh",
    "ъ" : "~",  "ы" : "y",  "ь" : "'",  "э" : "eh", "ю" : "ju", "я" : "ja", " " : "__", "_" : "__"
              };
   // note how DeTran is sorted. That is one of MAJOR differences btwn PHP & JS versions
   var DeTran = {
    "SHH"  : "Щ", // note this is tri-letter
    "CH"   : "Ч",  "SH"   : "Ш", "EH"   : "Э",  "JU"    : "Ю",  "_'"   : "Ь",  "_~"   : "Ъ", 
    "JO"   : "Ё",  "ZH"   : "Ж", "JJ"   : "Й",  "KH"    : "Х",  "JA"   : "Я",  // note they are bi-letters
    "A"    : "А",  "B"    : "Б",  "V"   : "В",  "G"     : "Г",  "D"    : "Д",  "E"    : "Е",  
    "Z"    : "З",  "I"    : "И",  "K"   : "К",  "L"     : "Л",  "M"    : "М",  "N"    : "Н",  
    "O"    : "О",  "P"    : "П",  "R"   : "Р",  "S"     : "С",  "T"    : "Т",  "U"    : "У",  
    "F"    : "Ф",  "C"    : "Ц",  "Y"   : "Ы",  
    "shh"  : "щ", // small tri-letters
    "jo"   : "ё",  "zh"   : "ж",   "jj"   : "й",  "kh"   : "х",  "ch"   : "ч",  "sh"   : "ш",
    "ju"   : "ю",  "ja"   : "я",   "__" : " ",  "eh"   : "э", // small bi-letters
    "a"    : "а",  "b"     : "б",  "v"    : "в",  "g"    : "г",  "d"    : "д",  "e"    : "е",  
    "z"    : "з",  "i"     : "и",  "k"    : "к",  "l"    : "л",  "m"    : "м",  "n"    : "н",
    "o"    : "о",  "p"     : "п",  "r"    : "р",  "s"    : "с",  "t"    : "т",  "u"    : "у",  
    "f"    : "ф",  "c"     : "ц",  "~"    : "ъ",  "y"    : "ы",  "'"    : "ь"
              };

   var result = "";
   if (!direction_decode)
   {
     str = str.replace( /[^\/\- _0-9a-zа-яА-ЯёЁ]/gi, "" );
     if (!allow_slashes) str = str.replace( /[^\/]/i, "");

     // пробел -- "русский" символ
     // все остальные не-буквы -- "английские" символы
     var is_rus = new RegExp( "[а-яА-ЯёЁ ]", "i" );

     // проходим по строке, разбивая её "русски-нерусски"
     var lang_eng = true;
     var _lang_eng = true;
     var temp;
     for (var i=0; i<str.length; i++)
     {
       _lang_eng = lang_eng;
       temp = String(str.charAt(i));
       if (temp.replace(is_rus, "") == temp) 
         lang_eng = true;
       else // convert; this conversion is the second MAJOR difference.
       {
         lang_eng = false;
         temp = Tran[ temp ]; 
       }
       if (lang_eng != _lang_eng) temp = "+"+temp;
       result += temp;
     }
   }
   else
   {
     var pgs = str.split("/");
     var DeTranRegex = new Array();
     for (var k in DeTran)
       DeTranRegex[k] = new RegExp( k, "g" );
     for (var j=0; j<pgs.length; j++)
     {
       var strings = pgs[j].split("+");
       for (var i=1; i<strings.length; i+=2)
         for (var k in DeTran)
           strings[i] = strings[i].replace( DeTranRegex[k], DeTran[k] );
       pgs[j] = strings.join("");
     }
     result = pgs.join( allow_slashes?"/":":" );
   }

   return result.replace( /\/+$/, "" );
}
