'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', 'Userservice', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth',
    function($scope, $location, Userservice, Log, Storage, Config, Authinfo, Auth) {

      //Options for Select2 plugin
      $scope.select2Options = {
        multiple: true,
        simple_tags: true,
        tags: [],
        tokenSeparators: [',', ' ']
      };

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

      $scope.addUsers = function(usersList) {
        console.log(usersList);

        Log.debug('Entitlements: ', usersList);

        var callback = function(data, status) {
          $scope.status = null;
          $scope.results = null;
          if (data.success) {
            Log.info('User add request returned:', data);
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

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          Userservice.addUsers(usersList, callback);
        }else {
          console.log('No users entered.');
        }

      };

      $scope.entitleUsers = function(usersList) {
        Log.debug('Entitlements: ', usersList);

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

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          Userservice.entitleUsers(usersList, callback);
        } else {
          console.log('No users entered.');
        }

      };
    }
  ]);
