(function () {
  'use strict';

  /* @ngInject */
  function LoginCtrl($location, $log, $rootScope, $scope, $state, $stateParams, Auth, Authinfo, Log, LogMetricsService, PageParam, SessionStorage, TokenService, Utils) {
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
        reauthorize: $stateParams.reauthorize
      })
        .then(function () {
          $log.debug("Debug: forcing first time setup");
          $state.go('firsttimewizard');
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
            } else if (!$stateParams.customerOrgId && Authinfo.isComplianceUserOnly()) {
              state = 'ediscovery.search';
            } else if (!$stateParams.customerOrgId && Authinfo.isHelpDeskAndComplianceUserOnly()) {
              state = 'support.status';
            } else if (Authinfo.isPartnerUser()) {
              state = 'partnercustomers.list';
            }
            $rootScope.services = Authinfo.getServices();

            if (state !== 'partneroverview') {
              Log.debug('Sending "customer logged in" metrics');
              LogMetricsService.logMetrics('Customer logged in', LogMetricsService.getEventType('customerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
            }

            $state.go(state, params);
          }
        }).catch(function () {
          $state.go('login-error');
        });
    };

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      $log.debug('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n' + JSON.stringify(toState) + JSON.stringify(toParams));
    });
    $rootScope.$on('$stateChangeError', function () {
      $log.debug('$stateChangeError - fired when an error occurs during transition.');
      $log.debug(arguments);
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      $log.debug('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
    });
    $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
      $log.debug('$viewContentLoading - view begins loading - dom not rendered' + viewConfig);
    });
    // $rootScope.$on('$viewContentLoaded',function(event){
    //   // runs on individual scopes, so putting it in "run" doesn't work.
    //   $log.debug('$viewContentLoaded - fired after dom rendered',event);
    $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
      $log.debug('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
      $log.debug(unfoundState, fromState, fromParams);
    });

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
