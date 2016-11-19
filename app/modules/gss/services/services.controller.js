(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('GSSServicesCtrl', GSSServicesCtrl);

  /* @ngInject */
  function GSSServicesCtrl($modal, $scope, GSSService) {
    var vm = this;

    vm.editService = editService;
    vm.deleteService = deleteService;

    init();

    function editService(service) {
      $modal.open({
        type: 'small',
        controller: 'EditServiceCtrl',
        controllerAs: 'editServiceCtrl',
        templateUrl: 'modules/gss/services/editService/editService.tpl.html',
        modalClass: 'status-edit-service',
        resolve: {
          theService: getService(service)
        }
      }).result.then(function () {
        refreshServices();
        notifyServiceEdited();
      });
    }

    function notifyServiceEdited() {
      $scope.$emit('serviceEdited');
    }

    function deleteService(service) {
      $modal.open({
        type: 'small',
        controller: 'DeleteServiceCtrl',
        controllerAs: 'deleteServiceCtrl',
        templateUrl: 'modules/gss/services/deleteService/deleteService.tpl.html',
        modalClass: 'status-delete-service',
        resolve: {
          theService: getService(service)
        }
      }).result.then(function () {
        refreshServices();
        notifyServiceDeleted();
      });
    }

    function notifyServiceDeleted() {
      $scope.$emit('serviceDeleted');
    }

    function refreshServices() {
      GSSService.getServices()
        .then(function (data) {
          vm.services = data;
        }).catch(function () {
          vm.services = [];
        });
    }

    function getService(service) {
      return service;
    }

    function init() {
      refreshServices();

      $scope.$on('serviceAdded', function () {
        refreshServices();
      });
    }
  }
})();
