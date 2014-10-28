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
    var getAuthinfoData = function() {
      $scope.username = Authinfo.getUserName();
      $scope.orgname = Authinfo.getOrgName();
    };
    getAuthinfoData();
    //update the scope when Authinfo data has been populated.
    $scope.$on('AuthinfoUpdated', function() {
      getAuthinfoData();
    });

    //$scope.image = 'images/most-interesting-man.jpg';

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
    } else {
      $scope.loggedIn = false;
    }

    $scope.$on('ACCESS_TOKEN_REVIEVED', function() {
      if (Auth.isLoggedIn()) {
        $scope.loggedIn = true;
      }
    });
  }
])

.controller('SettingsMenuCtrl', ['$scope', '$dialogs', '$location', 'ModalService', 'Config',
  function($scope, $dialogs, $location, ModalService, Config) {
    //LOOKTHISUPDUDE
    if(Config.isIntegration() || Config.isDev()) {
      $scope.menuItems = [{link: '/initialsetup', title: 'Initial Setup'}];
    } else {
      $scope.menuItems = [];
    }

    $scope.doAction = function(path) {
      if(path==='/initialsetup'){
        ModalService.showModal({
          templateUrl: 'modules/core/views/wizardmodal.html',
          controller: 'WizardModalCtrl',
          keyboard: true
        }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result){
            //Some cleanup necessary
            angular.element('body').removeClass('modal-open');
            angular.element('.modal-backdrop').fadeOut('normal', function(){
              angular.element('.modal-backdrop').remove();
            });
          });
        });
      } else {
        $location.path(path);
      }
    };
  }

]);
