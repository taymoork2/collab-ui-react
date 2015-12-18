(function () {
  'use strict';

  /* @ngInject */
  function GroupSettingsController($state, $modal, ServiceDescriptor, Authinfo, $stateParams) {
    var vm = this;
    vm.config = "";
    vm.cluster = $stateParams.cluster;
  }

  angular
    .module('Mediafusion')
    .controller('GroupSettingsController', GroupSettingsController);
}());
