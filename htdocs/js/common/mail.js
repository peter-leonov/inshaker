;(function(){

window.Mail =
{
  send: function (message, sent)
  {
    // window.setTimeout(function () { sent({statusType: 'success'}) }, 250)
    return Request.post('/act/message', message, sent)
  }
}

})();
