'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', '$window', 'Userservice', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth',
    function($scope, $location, $window, Userservice, Log, Storage, Config, Authinfo, Auth) {

      //tokenfield setup - Should make it into a directive later.
      angular.element('#usersfield').tokenfield({
        delimiter: [',', ';']
      })
        .on('tokenfield:preparetoken', function(e) {
          //Removing anything in brackets from user data
          var value = e.token.value.replace(/ *\([^)]*\) */g, '');
          e.token.value = value;
        })
        .on('tokenfield:createtoken', function(e) {
          var emailregex = /\S+@\S+\.\S+/;
          var valid = emailregex.test(e.token.value);
          if (!valid) {
            angular.element(e.relatedTarget).addClass('invalid');
          }
        });

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


      var getUsersList = function() {
        return $window.addressparser.parse(angular.element('#usersfield').tokenfield('getTokensList'));
      };

      $scope.status = null;
      $scope.results = null;

      $scope.isAddEnabled = function() {
        return Authinfo.isAddUserEnabled();
      };

      $scope.addUsers = function() {
        var usersList = getUsersList();
        console.log(usersList);
        Log.debug('Entitlements: ', usersList);
        $scope.results = {
          resultList: []
        };

        var callback = function(data, status) {
          if (data.success) {
            Log.info('User add request returned:', data);
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
        } else {
          console.log('No users entered.');
          var userResult = {
            message: 'Please enter user(s).'
          };
          $scope.results.resultList.push(userResult);
        }

      };

      $scope.entitleUsers = function() {
        var usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        $scope.results = {
          resultList: []
        };
        var callback = function(data, status) {
          if (data.success) {
            Log.info('User successfully entitled', data);

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
          var userResult = {
            message: 'Please enter user(s).'
          };
          $scope.results.resultList.push(userResult);
        }

      };
    }
  ]);
