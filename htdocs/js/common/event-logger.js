!function(){

window.EventLogger =
{
  log: function (type)
  {
    var fields = Array.from(arguments)
    fields.shift() // remove the type
    return Request.post('/act/event/' + type + '?' + fields.join(','), '')
  }
}

}();
