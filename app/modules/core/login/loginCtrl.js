'use strict';

angular.module('Core')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', '$log',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, $log) {

      var loadingDelay = 2000;
      var logoutDelay = 5000;

      var storedState = 'storedState';
      var storedParams = 'storedParams';
      var queryParams = SessionStorage.popObject('queryParams');

      $rootScope.token = Storage.get('accessToken');

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

      $scope.login = function () {
        Auth.redirectToLogin();
      };

      var authorizeUser = function () {
        $scope.loading = true;
        var loadingDelayPromise = $timeout(function () {}, loadingDelay);

        Auth.authorize($rootScope.token)
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
                if (Auth.isLoginMarked()) {
                  LogMetricsService.logMetrics('Partner logged in', LogMetricsService.getEventType('partnerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
                  Auth.clearLoginMarker();
                }
                state = 'partneroverview';

              } else if (Authinfo.isSupportUser()) {
                state = 'support.status';
              } else if (!$stateParams.customerOrgId && Authinfo.isHelpDeskUserOnly()) {
                state = 'helpdesk.search';
              } else if (Authinfo.isPartnerUser()) {
                state = 'partnercustomers.list';
              }
              $rootScope.services = Authinfo.getServices();

              if (state !== 'partneroverview' && Auth.isLoginMarked()) {
                LogMetricsService.logMetrics('Customer logged in', LogMetricsService.getEventType('customerLogin'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
                Auth.clearLoginMarker();
              }

              return loadingDelayPromise.then(function () {
                $state.go(state, params);
              });
            }
          }).catch(function (error) {
            if (error) {
              Auth.logout();
              // $timeout(function () {
              //   $scope.result = error;
              //   $timeout(Auth.logout, logoutDelay);
              // }, loadingDelay);
            } else {
              Auth.logout();
              // $timeout(Auth.logout, logoutDelay);
            }
          });
      };

      $scope.$on('ACCESS_TOKEN_RETRIEVED', function () {
        authorizeUser();
      });

      if (!_.isEmpty($rootScope.token)) {
        authorizeUser();
      } else if (!_.isNull(queryParams) && !_.isUndefined(queryParams.sso) && queryParams.sso === 'true') {
        Auth.redirectToLogin();
      }
    }
  ]);
