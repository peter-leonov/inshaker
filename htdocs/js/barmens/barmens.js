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
         barmanNameNode: $$('h1[data-barman-name]')[0]
      };
      var page = new BarmensPage();

      page.initialize(nodes);

      page.View.renderBarmanCocktails(nodes.barmanNameNode.getAttribute('data-barman-name '));
   });
})();

<!--# include virtual="model.js" -->
<!--# include virtual="view.js" -->
<!--# include virtual="controller.js" -->