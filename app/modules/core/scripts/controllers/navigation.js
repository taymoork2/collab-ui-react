'use strict';

angular.module('Core')
  .controller('NavigationCtrl', ['$rootScope','$scope', '$location', '$window', 'Storage', 'Config', 'Log', 'Authinfo', 'Utils', 'Auth',
    function($rootScope, $scope, $location, $window, Storage, Config, Log, Authinfo, Utils, Auth) {

      //update the scope when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        $scope.username = Authinfo.getUserName();
        $scope.orgname = Authinfo.getOrgName();
      });

      $scope.logout = function() {
        Auth.logout();
      };

      $scope.sendFeedback = function() {
        var userAgent = navigator.userAgent;
        userAgent = encodeURIComponent(userAgent);
        var logHistory = Log.getArchiveUrlencoded();
        var feedbackUrl = 'mailto:'+ Config.feedbackNavConfig.mailto +'?subject='+ Config.feedbackNavConfig.subject +'&body=User%20Agent:'+ userAgent +'%0D%0A%0D%0APlease%20type%20your%20feedback%20below:%0D%0A%0D%0A%0D%0A%0D%0AUser%20Logs:%0D%0A'+ logHistory;
        Log.debug('sending feedback: ' + feedbackUrl);
        $window.location.href = feedbackUrl;
      };

      if (Auth.isLoggedIn()) {
        $rootScope.loggedIn = true;
      } else if (!Auth.isAllowedPath()) {
        $rootScope.loggedIn = false;
        $location.path('/login');
      }
    }
  ]);
