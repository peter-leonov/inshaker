;
(function() {
   var myName = 'BarmensPage';
   var Me = self[myName] = MVC.create(myName);

   var myProto = {
      initialize: function() {
         this.model.initialize();
         this.view.initialize();
         this.controller.initialize();
      },
      bind: function(nodes, sources, state) {
         this.model.bind(sources);
         this.view.bind(nodes);
         this.controller.bind(state);

         return this;
      }
   };

   Object.extend(Me.prototype, myProto);

   $.onready(function () {
      var nodes = {
         barmanName: $$('h1')[0]
      };

      new BarmensPage().initialize(nodes);
   });
})();

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->