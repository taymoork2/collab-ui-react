'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('OrganizationsCtrl', ['$scope', '$location', 'Storage', '$route', '$routeParams', 'Log', 'Utils', '$filter', 'Orgservice', 'Authinfo', 'Auth', 'Notification', 'Config', 'LogService',
    function($scope, $location, Storage, $route, $routeParams, Log, Utils, $filter, Orgservice, Authinfo, Auth, Notification, Config, LogService) {

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

      $scope.$on('AuthinfoUpdated', function() {
        getorgInfo();
      });

      $scope.resetOrg = function() {
        getorgInfo();
      };
    }
  ]);
