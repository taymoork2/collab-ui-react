'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', 'Userservice', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth',
    function($scope, $location, Userservice, Log, Storage, Config, Authinfo, Auth) {


      //Populating authinfo data if empty.
      if (Authinfo.isEmpty()) {
        var token = Storage.get('accessToken');
        if (token) {
          Log.debug('Authorizing user... Populating admin data...');
          Auth.authorize(token, $scope);
        } else {
          Log.debug('No accessToken.');
        }
      }

      $scope.isAddEnabled = function() {
        return Authinfo.isAddUserEnabled();
      };

      function getUsers(userList) {
        return userList.split(';');
      }

      $scope.addUsers = function(userList) {

        Log.debug('Entitlements: ', userList);

        var callback = function(data, status) {
          $scope.status = null;
          $scope.results = null;
          if (data.success) {
            Log.info('User add reqeust returned:', data);
            $scope.results = {
              'resultList': []
            };

            for (var i = 0; i < data.userResponse.length; i++) {

              var userResult = {
                'email': data.userResponse[i].email
              };

              var userStatus = data.userResponse[i].status;

              if (userStatus === 200) {
                userResult.message = 'added successfully';
              } else if (userStatus === 409) {
                userResult.message = 'already exists';
              } else {
                userResult.message = 'not added, status: ' + userStatus;
              }

              $scope.results.resultList.push(userResult);

            }

          } else {
            Log.warn('Could not entitle the user', data);
            $scope.status = 'Request failed.  Status: ' + status + '\n' + data;
          }
        };

        if (userList) {
          Userservice.addUsers(getUsers(userList), callback);

        }
      };

      $scope.entitleUsers = function(userList) {
        Log.debug('Entitlements: ', userList);

        var callback = function(data, status) {
          $scope.status = null;
          $scope.results = null;
          if (data.success) {
            Log.info('User successfully entitled', data);
            $scope.results = {
              'resultList': []
            };

            for (var i = 0; i < data.userResponse.length; i++) {

              var userResult = {
                'email': data.userResponse[i].email
              };

              var userStatus = data.userResponse[i].status;

              if (userStatus === 200) {
                userResult.message = 'entitled successfully';
              } else if (userStatus === 404) {
                userResult.message = 'does not exists';
              } else {
                userResult.message = 'not entitled, status: ' + userStatus;
              }

              $scope.results.resultList.push(userResult);

            }

          } else {
            Log.warn('Could not entitle the user', data);
            $scope.status = 'Request failed.  Status: ' + status + '\n' + data;
          }
        };

        if (userList) {
          Userservice.entitleUsers(getUsers(userList), callback);

        }

      };
    }
  ]);
