(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSDeactivateController', HDSDeactivateController);

  /* @ngInject */
  function HDSDeactivateController($log) {
    //var vm = this;
    $log.info('Started dialog');
  }
}());
