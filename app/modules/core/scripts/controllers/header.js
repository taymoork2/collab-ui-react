'use strict';

angular.module('Core')
  .controller('HeaderCtrl', ['$scope',
    function($scope) {
      $scope.headerTitle = 'Cisco Collaboration Management';
      $scope.navStyle = 'admin';
    }
  ])

.controller('UserInfoCtrl', ['$scope', 'Authinfo', 'Auth', 'Log', 'Config', '$window', '$location',
  function($scope, Authinfo, Auth, Log, Config, $window, $location) {

    //update the scope when Authinfo data has been populated.
    $scope.$on('AuthinfoUpdated', function() {
      $scope.username = Authinfo.getUserName();
      $scope.orgname = Authinfo.getOrgName();
    });

    $scope.image = 'images/most-interesting-man.jpg';

    $scope.logout = function() {
      Auth.logout();
      $scope.loggedIn = false;
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
])

.controller('SettingsMenuCtrl', ['$scope',
  function($scope) {
    $scope.menuItems = [];
  }
]);
