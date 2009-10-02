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

var undef, myName = 'RuTils', Me = self[myName] = 
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

String.prototype.translify = function ()
{
	return Me.translify(this);
}

String.prototype.trans = function ()
{
	return Me.dirify(this);
}


})();
