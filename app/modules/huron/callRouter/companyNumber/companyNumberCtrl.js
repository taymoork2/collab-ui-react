(function () {
  'use strict';

  angular
    .module('uc.callrouter')
    .controller('companyNumber', companyNumber);

  /* @ngInject */
  function companyNumber($scope, $modalInstance, $translate, CallRouterService, Authinfo) {
    var vm = $scope;
    vm.model = {};
    vm.saveCompanyNumber = saveCompanyNumber;

    function saveCompanyNumber() {
      var data;
      var uuid;
      angular.forEach(vm.options, function (value, key) {
        if (vm.model.extnum === value.pattern) {
          uuid = value.uuid;
        }
      });
      data = {
        name: vm.model.orgname,
        externalCallerIdType: "Company Number",
        pattern: vm.model.number,
        externalNumber: {
          pattern: vm.model.number,
          uuid: uuid
        }
      };

      CallRouterService.save({
        customerId: Authinfo.getOrgId()
      }, data);

    }

    vm.companyNumber = [{
      key: 'name',
      type: 'input',
      templateOptions: {
        required: true,
        label: $translate.instant('routingModal.label'),
        type: 'text'
      }
    }, {
      key: 'number',
      type: 'select',
      templateOptions: {
        required: true,
        label: $translate.instant('routingModal.companynumber'),
        placeholder: 'Select Company Number',
        options: [],
        labelfield: 'pattern',
        valuefield: 'uuid',
        filter: true
      },
      controller: function ($scope, CallRouter) {
          CallRouter.loadExternalNumberPool('').then(function (data) {
            vm.options = data;
            if (data.directoryNumber == null) {
              $scope.to.options = data;
            }
          });
        }
        // }, {
        //   key: 'route',
        //   type: 'select',
        //   templateOptions: {
        //     label: $translate.instant('routingModal.routeto'),
        //     placeholder: 'Select Route',
        //     options: [],
        //     labelfield: 'fullName',
        //     valuefield: 'userName',
        //     filter: true
        // },
        // controller: function ($scope, CallRouter) {
        //   CallRouter.listUsers('', 'object').then(function (data) {
        //     angular.forEach(data, function (value, key) {
        //       if (value.firstName && value.lastName) {
        //         value.fullName = value.firstName + ' ' + value.lastName;
        //       } else if (value.lastName) {
        //         value.fullName = value.lastName;
        //       } else {
        //         value.fullName = value.userName;
        //       }
        //       if (key === data.length - 1) {
        //         $scope.to.options = data;
        //       }
        //     });

      //   });
      // }

    }];
  }
})();
