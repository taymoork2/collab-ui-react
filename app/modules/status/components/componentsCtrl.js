(function () {
  'use strict';

  angular
    .module('Status')
    .controller('ComponentsCtrl', ComponentsCtrl);

  /* @ngInject */
  function ComponentsCtrl() {
    var vm = this;
    vm.components = ["WebEx Meetings", "WebEx Messenger"];

    vm.title = 'Components';

  }
})();
