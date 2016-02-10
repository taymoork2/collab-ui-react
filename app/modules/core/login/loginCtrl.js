'use strict';

angular.module('Core')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', 'Log',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, Log) {

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
              if (Authinfo.isPartner()) {
                $scope.$emit('InvertNavigation');
              }
              if (PageParam.getRoute()) {
                state = PageParam.getRoute();
              } else if (SessionStorage.get(storedState)) {
                state = SessionStorage.pop(storedState);
                params = SessionStorage.popObject(storedParams);
              } else if (Authinfo.isPartnerAdmin()) {
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
        Auth.redirectToLogin();
      }

      // Remove when Microsoft fixes flexbox problem when min-height is defined (in messagebox-small).
      function isIe() {
        return false || ($window.navigator.userAgent.indexOf('MSIE') > 0 || $window.navigator.userAgent.indexOf('Trident') > 0);
      }

      $scope.checkForIeWorkaround = function () {
        if (isIe()) {
          return "vertical-ie-workaround";
        } else {
          return "";
        }
      };

    }
  ]);
