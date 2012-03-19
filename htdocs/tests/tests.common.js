;(function(){

function script (src) { document.write('<script src="' + src + '"></script>') }
function style (src) { document.write('<link rel="stylesheet" href="' + src + '"/>') }

script('/liby/modules/cascade.js')
script('/liby/modules/test.js')
script('/liby/modules/test-tool.js')
script('/liby/widgets/tests.js')

style('/liby/tests/tests.css')

})();