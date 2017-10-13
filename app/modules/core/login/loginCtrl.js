(function () {
  'use strict';

  var TimingKey = require('../metrics').TimingKey;

  /* @ngInject */
  function LoginCtrl($interval, $location, $rootScope, $scope, $state, $stateParams, $translate, Auth, Authinfo, Config, Log, LocalStorage, LogMetricsService, MetricsService, PageParam, SessionStorage, StorageKeys, TokenService, Utils, CacheWarmUpService) {
    MetricsService.startTimer(TimingKey.LOGIN_DURATION);
    var queryParams = SessionStorage.popObject(StorageKeys.REQUESTED_QUERY_PARAMS);
    var language = LocalStorage.get(StorageKeys.LANGUAGE);

    $scope.message = LocalStorage.get(StorageKeys.LOGIN_MESSAGE);

    if (language) {
      $translate.use(language).then(function () {
        moment.locale(language);
      });
    }

    var pageParam = $location.search().pp;
    if (pageParam) {
      PageParam.set(pageParam);
    }

    if ($stateParams.customerOrgId) {
      SessionStorage.put(StorageKeys.CUSTOMER_ORG_ID, $stateParams.customerOrgId);
    } else if ($stateParams.partnerOrgId) {
      SessionStorage.put(StorageKeys.PARTNER_ORG_ID, $stateParams.partnerOrgId);
    }

    if ($stateParams.subscriptionId) {
      SessionStorage.put(StorageKeys.SUBSCRIPTION_ID, $stateParams.subscriptionId);
    }

    // If the tab has logged out and we are logged into another tab
    // we want to allow the tab to get auth tokens from another logged in tab
    if (SessionStorage.get(StorageKeys.LOGOUT)) {
      SessionStorage.remove(StorageKeys.LOGOUT);
    }

    // Enable Atlas to seamlessly login (when already authenticated through CI) by allowing email parameter
    if ($stateParams.email) {
      Auth.redirectToLogin($stateParams.email);
    }

    if ($stateParams.bmmp_env) {
      SessionStorage.put(StorageKeys.BMMP_ENV, _.toLower($stateParams.bmmp_env));
    }

    $scope.checkForIeWorkaround = Utils.checkForIeWorkaround();

    $scope.login = function (keyCode) {
      if (!keyCode || (keyCode === 13 && $scope.loginForm.email.$valid)) {
        Auth.redirectToLogin($scope.email);
      }
    };

    var authorizeUser = function () {
      $scope.loading = true;
      var isSuccess = true;
      Auth.authorize({
        reauthorize: $stateParams.reauthorize,
      })
        .then(function () {
          CacheWarmUpService.warmUpCaches();
          $interval(function () {
            CacheWarmUpService.warmUpCaches();
          }, 100000);

          if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
            $state.go('firsttimewizard');
          } else {
            var state = 'overview';
            Authinfo.setCustomerView(true);
            var params;
            if (PageParam.getRoute()) {
              state = PageParam.getRoute();
            } else if (SessionStorage.get(StorageKeys.REQUESTED_STATE_NAME)) {
              state = SessionStorage.pop(StorageKeys.REQUESTED_STATE_NAME);
              params = SessionStorage.popObject(StorageKeys.REQUESTED_STATE_PARAMS);
            } else if ((Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin()) && !SessionStorage.get(StorageKeys.CUSTOMER_ORG_ID) && !SessionStorage.get(StorageKeys.PARTNER_ORG_ID)) {
              Log.debug('Sending "partner logged in" metrics');
              LogMetricsService.logMetrics('Partner logged in', LogMetricsService.getEventType('partnerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
              state = 'partneroverview';
              Authinfo.setCustomerView(false);
            } else if (Authinfo.isSupportUser()) {
              state = 'support.status';
            } else if (!SessionStorage.get(StorageKeys.CUSTOMER_ORG_ID) && Authinfo.isHelpDeskUserOnly()) {
              state = 'helpdesk.search';
            } else if (!SessionStorage.get(StorageKeys.CUSTOMER_ORG_ID) && Authinfo.isComplianceUserOnly()) {
              state = 'ediscovery.search';
            } else if (!SessionStorage.get(StorageKeys.CUSTOMER_ORG_ID) && Authinfo.isHelpDeskAndComplianceUserOnly()) {
              state = 'support.status';
            } else if (Authinfo.isPartnerUser()) {
              state = 'partnercustomers.list';
              Authinfo.setCustomerView(false);
            } else if (Authinfo.isTechSupport()) {
              state = 'gss';
            }
            $rootScope.services = Authinfo.getServices();

            if (state !== 'partneroverview') {
              Log.debug('Sending "customer logged in" metrics');
              LogMetricsService.logMetrics('Customer logged in', LogMetricsService.getEventType('customerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
            }
            $rootScope.$emit('LOGIN');
            return $state.go(state, params).catch(_.noop); // don't reject on $stateChangeStart prevention (eg. unauthorized)
          }
        }).catch(function () {
          isSuccess = false;
          return $state.go('login-error');
        }).finally(function () {
          MetricsService.stopTimer(TimingKey.LOGIN_DURATION, {
            success: isSuccess,
          });
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
