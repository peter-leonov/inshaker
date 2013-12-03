;(function(){

window.Mail =
{
  send: function (message, sent)
  {
    return Request.post('/act/message', message, sent)
  }
}

})();
