(function () {
  'use strict';

  angular
    .module('Status')
    .controller('ServiceManagementCtrl', ServiceManagementCtrl);

  /* @ngInject */
  function ServiceManagementCtrl(statusService, $modal) {
    var vm = this;
    statusService.getServices().then(function (data) {
      vm.services = data;
    });
    vm.editServiceModal = function (service) {
      var modal = $modal.open({
        type: 'small',
        controller: 'EditServiceCtrl',
        controllerAs: 'esc',
        templateUrl: 'modules/status/serviceManagement/editService.tpl.html',
        modalClass: 'status-edit-service',
        resolve: {
          serviceObj: function () {
            return service;
          }
        }
      });
      modal.result.then(function () {
        statusService.getServices().then(function (data) {
          vm.services = data;
        });
      });
    };
    vm.deleteServiceModal = function (service) {
      var modal = $modal.open({
        type: 'small',
        controller: 'DeleteServiceCtrl',
        controllerAs: 'dsc',
        templateUrl: 'modules/status/serviceManagement/deleteService.tpl.html',
        modalClass: 'status-delete-service',
        resolve: {
          serviceObj: function () {
            return service;
          }
        }
      });
      modal.result.then(function () {
        statusService.getServices().then(function (data) {
          vm.services = data;
        });
      });
    };
  }
})();
