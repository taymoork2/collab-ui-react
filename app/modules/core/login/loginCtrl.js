'use strict';

angular.module('Core')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'Localize',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, Localize) {

      var loadingDelay = 2000;
      var logoutDelay = 5000;
      var storedState = 'storedState';
      var storedParams = 'storedParams';

      var pageParam = $location.search().pp;
      if (pageParam) {
        console.log('page param detected: ' + pageParam);
        PageParam.set(pageParam);
      }

      if ($stateParams.customerOrgId && $stateParams.customerOrgName) {
        SessionStorage.put('customerOrgName', $stateParams.customerOrgName);
        SessionStorage.put('customerOrgId', $stateParams.customerOrgId);
      }

      var authorizeUser = function () {
        $scope.loading = true;

        var currentOrgId = SessionStorage.get('customerOrgId');
        Auth.authorize($rootScope.token).then(function () {
          if (!Authinfo.getSetupDone() && Authinfo.isCustomerAdmin()) {
            $state.go('firsttimewizard');
          } else {
            var path = 'home';
            var params;
            if (PageParam.getRoute()) {
              path = PageParam.getRoute();
            } else if (SessionStorage.get(storedState)) {
              path = SessionStorage.pop(storedState);
              params = SessionStorage.popObject(storedParams);
            } else if (Authinfo.getRoles().indexOf('PARTNER_ADMIN') > -1) {
              path = 'partnerhome';
            }
            $rootScope.services = Authinfo.getServices();

            $timeout(function () {
              $state.go(path, params);
            }, loadingDelay);
          }
        }).catch(function (error) {
          if (error) {
            $timeout(function () {
              $scope.result = error;
              $timeout(Auth.logout, logoutDelay);
            }, loadingDelay);
          } else {
            $timeout(Auth.logout, logoutDelay);
          }
        });
      };

      $scope.$on('ACCESS_TOKEN_REVIEVED', function () {
        authorizeUser();
      });

      if ($rootScope.token || Storage.get('accessToken')) {
        authorizeUser();
      }

      $scope.login = function () {
        Auth.redirectToLogin();
      };
    }
  ]);
