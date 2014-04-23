'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('NavigationCtrl', ['$scope', '$window', 'Storage', 'Config', 'Log', 'Authinfo',
    function($scope, $window, Storage, Config, Log, Authinfo) {

      //update the scope when Authinfo data has been populated.
      $scope.$on('AuthinfoUpdated', function() {
        $scope.username = Authinfo.getUserName();
        $scope.orgname = Authinfo.getOrgName();
      });

      if (Storage.get('accessToken')) {
        $scope.loggedIn = true;
      } else {
        $scope.loggedIn = false;
      }

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
        $scope.loggedIn = false;
        Log.debug('Redirected to logout url.');
        $window.location.href = logoutUrl;
      };

      $scope.sendFeedback = function() {
        var mailto = 'wx2-portal@cisco.com';
        var subject = 'Squared%20Admin%20Feedback';
        var userAgent = navigator.userAgent;
        userAgent = encodeURIComponent(userAgent);
        var logHistory = Log.getArchiveUrlencoded();
        var feedbackUrl = 'mailto:'+mailto+'?subject='+subject+'&body=User%20Agent:'+userAgent+'%0D%0A%0D%0APlease%20type%20your%20feedback%20below:%0D%0A%0D%0A%0D%0A%0D%0AUser%20Logs:%0D%0A'+logHistory;
        Log.debug('sending feedback: ' + feedbackUrl);
        $window.location.href = feedbackUrl;
      };

    }

  ]);
