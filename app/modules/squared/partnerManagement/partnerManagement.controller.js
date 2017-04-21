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
    vm.partnerOptions = _.map(vm.partnerTypes, function (s) { 
      return  { label: $translate.instant('partnerManagement.create.partnerTypes.' + s),
                value: s,
              };
            });

    // Error messages from validators
    vm.messages = {
      required: $translate.instant('partnerManagement.error.required'),
      email: $translate.instant('partnerManagement.error.email'),
      noMatch: $translate.instant('partnerManagement.error.noMatch'),
      unused: $translate.instant('partnerManagement.error.nameInUse'),
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
        if (resp.status === 204) {
          $state.go('partnerManagement.create');
          return;
        }
        if (resp.status === 200) {
          switch (resp.data.orgMatchBy) {
            case "EMAIL_ADDRESS":
              vm.data.name = resp.data.organizations[0].displayName;
              $state.go('partnerManagement.orgExists');
              loadOrgDetails(vm.data.name);
              break;

            case "DOMAIN":
              $state.go('partnerManagement.searchResults');
              break;

            case "NO_MATCH":
              $state.go('partnerManagement.create');
              break;

            default:
                Notification.errorWithTrackingId(resp,
                  'partnerManagement.error.searchFailed', 
                  {msg: $translate.instant('partnerManagement.error.unexpectedResp')});
          }
        }
      }).catch(function (resp) {
        vm.isLoading = false;
        Notification.errorWithTrackingId(resp,
        'partnerManagement.error.searchFailed', {msg: resp.data.message});
      });
    };

    vm.create = function () {
      vm.isLoading = true;
      svc.create(vm.data).then(function () {
        vm.isLoading = false;
        $state.go('partnerManagement.createSuccess');
      }).catch(function (resp) {
        vm.isLoading = false;
        if (resp.data.message === ('Organization ' + vm.data.name +
          ' already exists in CI')) {
          vm.duplicateName = vm.data.name;
          $scope.$$childHead.createForm.name.$validate();
        } else {
          Notification.errorWithTrackingId(resp,
            'partnerManagement.error.createFailed', {msg: resp.data.message});
        }
      });
    };

    vm.done = function () {
      vm.isLoading = false;
      $state.go('support.status');
    };

    vm.startOver = function () {
      initData();
      $state.go('partnerManagement.search');
    };

    function loadOrgDetails(name) {
      vm.isLoading = true;
      vm.isLoading = false;
    }
  }

  angular
    .module('Squared')
    .directive('validateMatch', validateMatchDirective)
    .directive('validateUnused', validateUnusedDirective)
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

  function validateUnusedDirective() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$validators.unused = function (value) {
          return _.isEmpty(scope.vm.duplicateName) || 
            (value !== scope.vm.duplicateName);
        };
      },
    };
  }
}());

/* eslint-enable */
