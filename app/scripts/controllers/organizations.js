'use strict';

/* global $ */

angular.module('wx2AdminWebClientApp')
  .controller('OrganizationsCtrl', ['$rootScope', '$scope', 'UserListService', 'Authinfo', 'Storage', 'Log', 'Auth', '$filter',
    function($rootScope, $scope, UserListService, Authinfo, Storage, Log, Auth, $filter) {

      //Populating authinfo data if empty.
      if (Authinfo.isEmpty()) {
        var token = Storage.get('accessToken');
        if (token) {
          Log.debug('Authorizing user... Populating admin data...');
          Auth.authorize(token, $scope);
        } else {
          Log.debug('No accessToken.');
        }
      } else {
        Log.debug('Authinfo data found.');
      }

      //Making sure the search field is cleared
      $('#search-input').val('');

      $('#btncover').hide();
      $scope.exportBtn = {
        title: $filter('translate')('orgsPage.exportBtn'),
        disabled: false
      };

      if ($rootScope.exporting === true) {
        $scope.exportBtn.title = $filter('translate')('orgsPage.loadingMsg');
        $scope.exportBtn.disabled = true;
        $('#btncover').show();
      }

      $scope.$on('EXPORT_FINISHED', function() {
        $scope.exportBtn.disabled = false;
      });

      $scope.exportCSV = function() {
        return UserListService.exportCSV($scope);
      };

    }
  ]);
