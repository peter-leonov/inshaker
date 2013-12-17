;(function(){

window.Mail =
{
  send: function (message, sent)
  {
    // console.log(message)
    // window.setTimeout(function () { sent({statusType: 'success'}) }, 250)
    message['h:X-User-Agent'] = window.navigator.userAgent
    message['h:X-Client-Address'] = window.navigator.publicIP
    return Request.post('/act/message', message, sent)
  }
}

})();
