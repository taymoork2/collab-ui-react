'use strict';

/* global $ */

angular.module('wx2AdminWebClientApp')
  .controller('OrganizationsCtrl', ['$rootScope','$scope', 'Storage', 'Log', '$filter', 'Orgservice', 'Authinfo', 'Auth', 'UserListService', 'Notification',
    function($rootScope, $scope, Storage, Log, $filter, Orgservice, Authinfo, Auth, UserListService, Notification) {

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;

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

      //A div used to cover the export button when it's disabled.
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
        var promise = UserListService.exportCSV($scope);
        promise.then(null, function(error){
          Notification.notify(Array.new(error), 'error');
        });

        return promise;
      };

      $scope.$on('AuthinfoUpdated', function() {
        getorgInfo();
      });

      $scope.resetOrg = function() {
        getorgInfo();
      };
    }
  ]);
