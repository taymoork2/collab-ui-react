(function () {
  'use strict';

  /* @ngInject */
  function LoginCtrl($location, $rootScope, $scope, $state, $stateParams, $translate, Auth, Authinfo, Config, Log, LogMetricsService, PageParam, SessionStorage, Storage, StorageKeys, TokenService, Utils) {
    var queryParams = SessionStorage.popObject(StorageKeys.REQUESTED_QUERY_PARAMS);
    var language = Storage.get('language');

    $scope.message = Storage.get('loginMessage');

    if (language) {
      $translate.use(language).then(function () {
        moment.locale(language);
      });
    }

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

    // If the tab has logged out and we are logged into another tab
    // we want to allow the tab to get auth tokens from another logged in tab
    if (SessionStorage.get('logout')) {
      SessionStorage.remove('logout');
    }

    $scope.checkForIeWorkaround = Utils.checkForIeWorkaround();

    $scope.login = function (keyCode) {
      if (!keyCode || (keyCode === 13 && $scope.loginForm.email.$valid)) {
        Auth.redirectToLogin($scope.email);
      }
    };

    var authorizeUser = function () {
      $scope.loading = true;
      Auth.authorize({
        reauthorize: $stateParams.reauthorize,
      })
        .then(function () {
          if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
            $state.go('firsttimewizard');
          } else {
            var state = 'overview';
            var params;
            if (PageParam.getRoute()) {
              state = PageParam.getRoute();
            } else if (SessionStorage.get(StorageKeys.REQUESTED_STATE_NAME)) {
              state = SessionStorage.pop(StorageKeys.REQUESTED_STATE_NAME);
              params = SessionStorage.popObject(StorageKeys.REQUESTED_STATE_PARAMS);
            } else if ((Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin()) && !$stateParams.customerOrgId && !$stateParams.partnerOrgId) {
              Log.debug('Sending "partner logged in" metrics');
              LogMetricsService.logMetrics('Partner logged in', LogMetricsService.getEventType('partnerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
              state = 'partneroverview';
            } else if (Authinfo.isSupportUser()) {
              state = 'support.status';
            } else if (!$stateParams.customerOrgId && Authinfo.isHelpDeskUserOnly()) {
              state = 'helpdesk.search';
            } else if (!$stateParams.customerOrgId && Authinfo.isComplianceUserOnly()) {
              state = 'ediscovery.search';
            } else if (!$stateParams.customerOrgId && Authinfo.isHelpDeskAndComplianceUserOnly()) {
              state = 'support.status';
            } else if (Authinfo.isPartnerUser()) {
              state = 'partnercustomers.list';
            } else if (Authinfo.isTechSupport()) {
              state = 'gss';
            }
            $rootScope.services = Authinfo.getServices();

            if (state !== 'partneroverview') {
              Log.debug('Sending "customer logged in" metrics');
              LogMetricsService.logMetrics('Customer logged in', LogMetricsService.getEventType('customerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
            }
            $rootScope.$emit('LOGIN');
            $state.go(state, params);
          }
        }).catch(function () {
          $state.go('login-error');
        });
    };

    $scope.$on('ACCESS_TOKEN_RETRIEVED', function () {
      authorizeUser();
    });

    if (!_.isEmpty(TokenService.getAccessToken())) {
      authorizeUser();
    } else if (!_.isNull(queryParams) && !_.isUndefined(queryParams.sso) && queryParams.sso === 'true') {
      Auth.redirectToLogin(null, queryParams.sso);
    }

  }

  module.exports = LoginCtrl;
})();
