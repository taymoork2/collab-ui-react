'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('NavigationCtrl', ['$rootScope','$scope', '$location', '$window', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function($rootScope, $scope, $location, $window, Storage, Config, Log, Auth, Authinfo) {

      //update the scope when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        $scope.username = Authinfo.getUserName();
        $scope.orgname = Authinfo.getOrgName();
      });

      //Set logout redirect depending on environment
      var logoutUrl = null;
      if (Config.isDev()) {
        logoutUrl = Config.logoutUrl + encodeURIComponent(Config.adminClientUrl.dev);
      } else if(Config.isIntegration()) {
        logoutUrl = Config.logoutUrl + encodeURIComponent(Config.adminClientUrl.integration);
      } else {
        logoutUrl = Config.logoutUrl + encodeURIComponent(Config.adminClientUrl.prod);
      }

      $scope.logout = function() {
        Storage.clear();
        $rootScope.loggedIn = false;
        Log.debug('Redirected to logout url.');
        $window.location.href = logoutUrl;
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
        $scope.loggedIn = true;
      } else if (!Auth.isAllowedPath()) {
        $scope.loggedIn = false;
        $location.path('/login');
      }
    }
  ]);
