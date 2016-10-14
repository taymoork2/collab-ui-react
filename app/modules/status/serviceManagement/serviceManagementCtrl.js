(function () {
  'use strict';

  angular
    .module('Status')
    .controller('ServiceManagementCtrl', ServiceManagementCtrl);

  /* @ngInject */
  function ServiceManagementCtrl(statusService, $modal, $scope) {
    var vm = this;
    function getServicesFun() {
      statusService.getServices().then(function (data) {
        vm.services = data;
      });
    }
    getServicesFun();
    $scope.$on('optionsChange', function () {
      getServicesFun();
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
          var sList = _.map(vm.services, function (service) {
            return {
              label: service.serviceName,
              value: service.serviceId
            };
          });
          $scope.$parent.status.options = [].concat(sList, [$scope.$parent.status.options.pop()]);
        });
      });
    };
  }
})();
