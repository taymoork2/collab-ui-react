(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OrganizationFeaturesCtrl', OrganizationFeaturesCtrl);

  /* @ngInject */
  function OrganizationFeaturesCtrl($stateParams, $rootScope, $scope, $state, $location, Storage, Log, $filter, Orgservice, Authinfo, Notification, $dialogs) {
    var vm = this;
    vm.currentOrganization = $stateParams.currentOrganization;
    vm.options = [{
      label: 'On',
      value: 1,
      name: 'featureToggle'
    }, {
      label: 'Off',
      value: 0,
      name: 'featureToggle'
    }];
    vm.selected = 1;
    vm.test = 'test';
  }
})();
