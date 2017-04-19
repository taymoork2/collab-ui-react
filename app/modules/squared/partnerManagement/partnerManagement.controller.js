require('./partnerManagement.scss');

/* eslint-disable */

(function () {
  'use strict';

  /* @ngInject */
  function PartnerManagementController($scope, $state, $translate, $window,
    Notification, PartnerManagementService) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant('partnerManagement.browserTabHeaderTitle');
    });

    var vm = this;
    var svc = PartnerManagementService;

    $scope.vm = vm;
    vm.isLoading = false;

    vm.partnerPlaceholder = $translate.instant('partnerManagement.create.selectPartnerPlaceholder');
    vm.partnerTypes = ['DISTI', 'DVAR', 'RESELLER', 'NA'];
    vm.partnerOptions = _.map(vm.partnerTypes, function (s) { return $translate.instant('partnerManagement.create.partnerTypes.' + s); });

    // Error messages from validators
    vm.messages = {
      required: $translate.instant('partnerManagement.error.required'),
      email: $translate.instant('partnerManagement.error.email'),
      noMatch: $translate.instant('partnerManagement.error.noMatch'),
    };

    // reset form data
    function initData() {
      vm.data = {
        email: '',
        confirmEmail: '',
        name: '',
        confirmName: '',
        partnerType: '',
        lifeCyclePartner: false,
      };
    }
    initData();

    vm.search = function () {
      vm.isLoading = true;
      svc.search(vm.data.email).then(function (resp) {
        vm.isLoading = false;
        if (resp.status === 200) {
          if (_.isEmpty(resp.data)) {
            $state.go('partnerManagement.create');
          } else {
            $state.go('partnerManagement.serchResults');
          }
        }
      }).catch(function (resp) {
        vm.isLoadign = false;
        Notification.errorWithTrackingId(resp, 'partnerManagement.error.searchFailed');
      });
    };

    vm.create = function () {
      vm.isLoading = true;
      svc.create(vm.data).then(function () {
        vm.isLoading = false;
        $state.go('partnerManagement.createSuccess');
      });
    };

    vm.done = function () {
      vm.isLoading = false;
    };

    vm.startOver = function () {
      initData();
      $state.go('partnerManagement.search');
    };
  }

  angular
    .module('Squared')
    .directive('validateMatch', validateMatchDirective)
    .controller('PartnerManagementController', PartnerManagementController);

  function validateMatchDirective() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.noMatch = function (value) {
          return attrs.validateMatch === value;
        };
      },
    };
  }
}());

/* eslint-enable */
