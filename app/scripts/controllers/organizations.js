'use strict';

/* global $ */

angular.module('wx2AdminWebClientApp')
  .controller('OrganizationsCtrl', ['$rootScope','$scope', 'Storage', 'Log', '$filter', 'Orgservice', 'Authinfo', 'Auth', 'UserListService',
    function($rootScope, $scope, Storage, Log, $filter, Orgservice, Authinfo, Auth, UserListService) {

      $scope.orgName = Authinfo.getOrgName();

      var getorgInfo = function () {
        Orgservice.getOrg(function(data, status) {
          if (data.success) {
            $scope.org = data;
            if (data.services)
            {
              $scope.svcs = data.services;
            }

          } else {
            Log.debug('Get existing org failed. Status: ' + status);
          }
        });
      };

      if (!Authinfo.isEmpty()) {
        getorgInfo();
      }
      else
      {
        var token = Storage.get('accessToken');
        if (token) {
          Log.debug('Authorizing user... Populating admin data...');
          Auth.authorize(token, $scope);
        } else {
          Log.debug('No accessToken.');
        }
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

      $scope.$on('AuthinfoUpdated', function() {
        getorgInfo();
      });

      $scope.resetOrg = function() {
        getorgInfo();
      };
    }
  ]);
