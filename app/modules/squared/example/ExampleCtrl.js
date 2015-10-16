'use strict';

/* @ngInject */
function ExampleCtrl() {
  this.pageHeader = {
    title: 'PageHeader',
    back: true,
    tabs: [{
      title: 'First tab',
      state: 'example.tab1'
    }, {
      title: 'Second tab',
      state: 'example.tab2'
    }, {
      title: 'The last tab',
      state: 'example.tab3'
    }]
  };
}

angular
  .module('Squared')
  .controller('ExampleCtrl', ExampleCtrl);
