(function() {
  'use strict';

  angular.module('Core')
    .controller('LoginCtrl', LoginCtrl);

  /* @ngInject */
  function LoginCtrl($filter, $http, $location, $rootScope, $scope, $state, $stateParams, $timeout, $window, Auth, Authinfo, Config, Log, LogMetricsService, PageParam, SessionStorage, Storage, Utils) {

    var loadingDelay = 2000;
    var logoutDelay = 5000;

    var storedState = 'storedState';
    var storedParams = 'storedParams';
    var queryParams = SessionStorage.popObject('queryParams');

    var pageParam = $location.search().pp;
    if (pageParam) {
      PageParam.set(pageParam);
    }

    if ($stateParams.customerOrgId && $stateParams.customerOrgName) {
      SessionStorage.put('customerOrgName', $stateParams.customerOrgName);
      SessionStorage.put('customerOrgId', $stateParams.customerOrgId);
    } else if ($stateParams.partnerOrgId && $stateParams.partnerOrgName) {
      SessionStorage.put('partnerOrgName', $stateParams.partnerOrgName);
      SessionStorage.put('partnerOrgId', $stateParams.partnerOrgId);
    }

    $scope.checkForIeWorkaround = Utils.checkForIeWorkaround();

    $scope.login = function (keyCode) {
      if (!keyCode || (keyCode === 13 && $scope.loginForm.email.$valid)) {
        Auth.redirectToLogin($scope.email);
      }
    };

    var authorizeUser = function () {
      $scope.loading = true;
      var loadingDelayPromise = $timeout(function () {}, loadingDelay);

      Auth.authorize()
        .then(function () {
          if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
            $state.go('firsttimewizard');
          } else {
            var state = 'overview';
            var params;
            if (PageParam.getRoute()) {
              state = PageParam.getRoute();
            } else if (SessionStorage.get(storedState)) {
              state = SessionStorage.pop(storedState);
              params = SessionStorage.popObject(storedParams);
            } else if (Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin()) {
              Log.debug('Sending "partner logged in" metrics');
              LogMetricsService.logMetrics('Partner logged in', LogMetricsService.getEventType('partnerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
              state = 'partneroverview';
            } else if (Authinfo.isSupportUser()) {
              state = 'support.status';
            } else if (!$stateParams.customerOrgId && Authinfo.isHelpDeskUserOnly()) {
              state = 'helpdesk.search';
            } else if (Authinfo.isPartnerUser()) {
              state = 'partnercustomers.list';
            }
            $rootScope.services = Authinfo.getServices();

            if (state !== 'partneroverview') {
              Log.debug('Sending "customer logged in" metrics');
              LogMetricsService.logMetrics('Customer logged in', LogMetricsService.getEventType('customerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
            }
            return loadingDelayPromise.then(function () {
              $state.go(state, params);
            });
          }
        }).catch(function (error) {
          $state.go('login-error');
        });
    };

    $scope.$on('ACCESS_TOKEN_RETRIEVED', function () {
      authorizeUser();
    });

    if (!_.isEmpty(Storage.get('accessToken'))) {
      authorizeUser();
    } else if (!_.isNull(queryParams) && !_.isUndefined(queryParams.sso) && queryParams.sso === 'true') {
      Auth.redirectToLogin(null, queryParams.sso);
    }

  }
})();