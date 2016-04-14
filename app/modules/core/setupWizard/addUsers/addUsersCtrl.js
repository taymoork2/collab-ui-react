'use strict';

angular.module('Core')
  .controller('AddUserCtrl', ['$scope', '$q', '$location', 'DirSyncService', 'Log', '$translate', 'Notification', 'UserListService', 'Storage', 'Utils', '$filter', 'Userservice', 'LogMetricsService', '$window', 'Config', 'FeatureToggleService',
    function ($scope, $q, $location, DirSyncService, Log, $translate, Notification, UserListService, Storage, Utils, $filter, Userservice, LogMetricsService, $window, Config, FeatureToggleService) {
      var invalidcount = 0;
      $scope.options = {
        addUsers: 0
      };

      FeatureToggleService.supportsDirSync().then(function (dirSyncEnabled) {
        if (dirSyncEnabled) {
          $scope.options.addUsers = 2;
        }
      });

      $scope.syncSimple = {
        label: $translate.instant('firstTimeWizard.simple'),
        value: 0,
        name: 'syncOptions',
        id: 'syncSimple'
      };
      $scope.syncUpload = {
        label: $translate.instant('firstTimeWizard.upload'),
        value: 1,
        name: 'syncOptions',
        id: 'syncUpload'
      };
      $scope.syncAdvanced = {
        label: $translate.instant('firstTimeWizard.advanced'),
        value: 2,
        name: 'syncOptions',
        id: 'syncAdvanced'
      };

      $scope.initNext = function () {
        var deferred = $q.defer();

        if (angular.isDefined($scope.options.addUsers) && angular.isDefined($scope.wizard) && angular.isFunction($scope.wizard.setSubTab)) {
          var simpleSubTab = _.findWhere($scope.wizard.current.tab.subTabs, {
            name: 'simple'
          });
          var csvSubTab = _.findWhere($scope.wizard.current.tab.subTabs, {
            name: 'csv'
          });
          var advancedSubTab = _.findWhere($scope.wizard.current.tab.subTabs, {
            name: 'advanced'
          });
          if ($scope.options.addUsers === 0) {
            $scope.wizard.setSubTab(simpleSubTab);
          } else if ($scope.options.addUsers === 1) {
            $scope.wizard.setSubTab(csvSubTab);
          } else if ($scope.options.addUsers === 2) {
            $scope.wizard.setSubTab(advancedSubTab);
          }
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      };

      var allSteps = ['chooseSync', 'domain', 'installCloud', 'syncStatus', 'manual'];
      var manualSteps = ['manual'];
      var dirsyncSteps = ['domain', 'installCloud', 'syncStatus'];

      for (var stepNum in allSteps) {
        var step = allSteps[stepNum];
        if (step !== 'chooseSync') {
          $('#' + step).addClass('ng-hide');
          $('#' + step + 'Tab').addClass('ng-hide');
        } else {
          $('#' + step).addClass('ng-show');
          $('#' + step + 'Tab').addClass('ng-show');
          $('#' + step + 'Tab').addClass('tabHighlight');
        }
      }

      $scope.numUsersInSync = 0;
      $scope.domainExists = true;
      $scope.domain = '';
      $scope.dirsyncStatus = '';
      $scope.gridOptions = {
        data: 'userList',
        multiSelect: false,
        enableRowHeaderSelection: false,
        enableColumnResize: true,
        enableColumnMenus: false,
      };

      $scope.setupTokenfield = function () {
        //console.log('test');
        //tokenfield setup - Should make it into a directive later.
        angular.element('#usersfield-wiz').tokenfield({
            delimiter: [',', ';'],
            createTokensOnBlur: true
          })
          .on('tokenfield:createtoken', function (e) {
            //Removing anything in brackets from user data
            var value = e.attrs.value.replace(/\s*\([^)]*\)\s*/g, ' ');
            e.attrs.value = value;
          })
          .on('tokenfield:createdtoken', function (e) {
            if (!validateEmail(e.attrs.value)) {
              angular.element(e.relatedTarget).addClass('invalid');
              invalidcount++;
            }
            checkButtons();
            checkPlaceholder();
          })
          .on('tokenfield:edittoken', function (e) {
            if (!validateEmail(e.attrs.value)) {
              invalidcount--;
            }
          })
          .on('tokenfield:removetoken', function (e) {
            if (!validateEmail(e.attrs.value)) {
              invalidcount--;
            }
            checkButtons();
            checkPlaceholder();
          });
      };

      $scope.chooseNextStep = function () {
        var syncOption = $scope.chooseSync;
        if (syncOption === 'dirsync') {
          $scope.showStep('domain');
        } else if (syncOption === 'manual') {
          $scope.showStep('manual');
        } else {
          Notification.notify([$translate.instant('firstTimeWizard.chooseSync', {
            status: status
          })], 'error');
        }
      };

      $scope.chooseSkipStep = function () {
        $location.path('/home');
      };

      $scope.chooseBackStep = function () {
        $location.path('/initialsetup/accountreview');
      };

      $scope.manualNextStep = function () {
        $location.path('/home');
      };

      $scope.manualBackStep = function () {
        $scope.showStep('chooseSync');
      };

      $scope.domainNextStep = function () {
        $scope.setDomain();
        $scope.showStep('installCloud');
      };

      $scope.domainBackStep = function () {
        $scope.showStep('chooseSync');
      };

      $scope.installNextStep = function () {
        $scope.getStatus();
        $scope.showStep('syncStatus');
      };

      $scope.installBackStep = function () {
        $scope.showStep('domain');
      };

      $scope.syncNextStep = function () {
        $location.path('/home');
      };

      $scope.syncBackStep = function () {
        $scope.showStep('installCloud');
      };

      $scope.showStep = function (thisStep) {

        //remove other pages are tab highlight from view
        for (var stepNum in allSteps) {
          var step = allSteps[stepNum];
          if (step !== thisStep) {
            $('#' + step).removeClass('ng-show');
            $('#' + step).addClass('ng-hide');
            $('#' + step + 'Tab').removeClass('tabHighlight');

          } else {
            $('#' + step).removeClass('ng-hide');
            $('#' + step).addClass('ng-show');
            $('#' + step + 'Tab').addClass('tabHighlight');
          }
        }

        if (thisStep === 'chooseSync') {
          for (var choosestepNum in allSteps) {
            var choosestep = allSteps[choosestepNum];
            $('#' + choosestep + 'Tab').removeClass('ng-show');
            $('#' + choosestep + 'Tab').addClass('ng-hide');
          }
          $('#chooseSyncTab').addClass('ng-show');
          $('#chooseSyncTab').removeClass('ng-hide');
        } else {
          $('#chooseSyncTab').removeClass('ng-show');
          $('#chooseSyncTab').addClass('ng-hide');
          var syncOption = $scope.chooseSync;
          if (syncOption === 'dirsync') {
            for (var dirstepNum in dirsyncSteps) {
              var dirstep = dirsyncSteps[dirstepNum];
              $('#' + dirstep + 'Tab').addClass('ng-show');
              $('#' + dirstep + 'Tab').removeClass('ng-hide');
            }
            for (var manstepNum in manualSteps) {
              var manstep = manualSteps[manstepNum];
              $('#' + manstep + 'Tab').removeClass('ng-show');
              $('#' + manstep + 'Tab').addClass('ng-hide');
            }
          } else if (syncOption === 'manual') {
            for (var manstepNumm in manualSteps) {
              var mannstep = manualSteps[manstepNumm];
              $('#' + mannstep + 'Tab').addClass('ng-show');
              $('#' + mannstep + 'Tab').removeClass('ng-hide');
            }
            for (var dirstepNumm in dirsyncSteps) {
              var dirrstep = dirsyncSteps[dirstepNumm];
              $('#' + dirrstep + 'Tab').removeClass('ng-show');
              $('#' + dirrstep + 'Tab').addClass('ng-hide');
            }
          }
        }
      };

      //*********************************************DIRSYNC*********************************************//
      $scope.getDefaultDomain = function () {
        DirSyncService.getDirSyncDomain(function (data, status) {
          if (data.success) {
            Log.debug('Retrieved DirSync domain name. Status: ' + status);
            if (data && data.domains[0]) {
              $scope.domain = data.domains[0].domainName;
              if ($scope.domain.length > 0) {
                $scope.domainExists = true;
              } else {
                $scope.domainExists = false;
              }
            }
          } else {
            Log.debug('Failed to retrieve directory sync configuration. Status: ' + status);
            // Notification.notify([$translate.instant('dirsyncModal.getDomainFailed', {
            //   status: status
            // })], 'error');
          }
        });
      };

      $scope.setDomainName = function (domainName) {
        $scope.domain = domainName.value;
      };

      $scope.setDomain = function () {
        if (($scope.domain.length > 0) && ($scope.domainExists !== true)) {
          DirSyncService.postDomainName($scope.domain, function (data, status) {
            if (data.success) {
              Log.debug('Created DirSync domain. Status: ' + status);
            } else {
              Log.debug('Failed to create directory sync domain. Status: ' + status);
              Notification.notify([$translate.instant('dirsyncModal.setDomainFailed', {
                status: status
              })], 'error');
            }
          });
        }
      };

      $scope.formatDate = function (date) {
        if (date !== '') {
          return moment.utc(date).local().format('MMM D \'YY h:mm a');
        } else {
          return date;
        }
      };

      $scope.getStatus = function () {
        $scope.dirsyncStatus = '';
        $scope.numUsersInSync = 0;
        $scope.userList = [];
        $scope.useNameList = [];
        $scope.dirsyncUserCountText = '';

        DirSyncService.getDirSyncStatus(function (data, status) {
          if (data.success) {
            Log.debug('Retrieved DirSync status successfully. Status: ' + status);
            if (data) {
              $scope.dirsyncStatus = data.result;
              $scope.lastEndTime = data.lastEndTime;
            }
          } else {
            Log.debug('Failed to retrieve directory sync status. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.getStatusFailed', {
              status: status
            })], 'error');
          }
        });

        return UserListService.exportCSV().then(function (csvData) {
          csvData.shift();
          $scope.numUsersInSync = csvData.length;
          $scope.dirsyncUserCountText = $translate.instant('firstTimeWizard.syncAgreementText');
          _.forEach(csvData, function(row) {
            var userArrObj = {
              Email: null,
              Name: null
            };
            var userNameObj = {
              firstName: null,
              lastName: null
            };
            userArrObj.Email = row.email;
            userArrObj.Name = _.trim(row.firstName + ' ' + row.lastName);
            if (!userArrObj.Name) {
              userArrObj.Name = row.displayName;
            }
            $scope.userList.push(userArrObj);

            userNameObj.firstName = row.firstName;
            userNameObj.lastName = row.lastName;
            $scope.useNameList.push(userNameObj);
          });
          return $q.resolve();
        });
      };

      $scope.syncNow = function () {
        $scope.syncNowLoad = true;
        DirSyncService.syncUsers(500, function (data, status) {
          if (data.success) {
            $scope.syncNowLoad = false;
            Log.debug('DirSync started successfully. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.dirsyncSuccess', {
              status: status
            })], 'success');
          } else {
            $scope.syncNowLoad = false;
            Log.debug('Failed to start directory sync. Status: ' + status);
            Notification.notify([$translate.instant('dirsyncModal.dirsyncFailed', {
              status: status
            })], 'error');
          }
        });
      };

      //*********************************************MANUAL ENTRY*********************************************//
      $scope.init = function () {
        setPlaceholder();
      };

      function setPlaceholder() {
        var placeholder = $filter('translate')('usersPage.userInput');
        angular.element('#usersfield-wiz-tokenfield').attr('placeholder', placeholder);
      }

      //email validation logic
      function validateEmail(input) {
        var emailregex = /\S+@\S+\.\S+/;
        var emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
        var emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
        var valid = false;

        if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
          valid = true;
        } else if (/["]/.test(input) && emailregexquotes.test(input)) {
          valid = true;
        } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
          valid = true;
        }

        return valid;
      }

      //placeholder logic
      function checkPlaceholder() {
        if (angular.element('.token-label').length > 0) {
          angular.element('#usersfield-wiz-tokenfield').attr('placeholder', '');
        } else {
          setPlaceholder();
        }
      }

      function checkButtons() {
        if (invalidcount > 0) {
          angular.element('#btnInvite').prop('disabled', true);
        } else {
          angular.element('#btnInvite').prop('disabled', false);
        }
      }

      function getUsersList() {
        return $window.addressparser.parse(angular.element('#usersfield-wiz').tokenfield('getTokensList'));
      }

      var resetUsersfield = function () {
        angular.element('#usersfield-wiz').tokenfield('setTokens', ' ');
        checkPlaceholder();
        invalidcount = 0;
      };

      $scope.clearPanel = function () {
        resetUsersfield();
        $scope.results = null;
      };

      var startLog;
      $scope.inviteUsers = function () {
        var usersList = getUsersList();
        Log.debug('Invite: ', usersList);
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var callback = function (data, status) {

          if (data.success) {
            Log.info('User invitation sent successfully.', data.id);
            // var success = [$translate.instant('usersPage.successInvite', data)];
            // Notification.notify(success, 'success');
            for (var i = 0; i < data.inviteResponse.length; i++) {

              var userResult = {
                email: data.inviteResponse[i].email,
                alertType: null
              };

              var userStatus = data.inviteResponse[i].status;

              if (userStatus === 200) {
                userResult.alertType = 'success';
              } else {
                userResult.alertType = 'danger';
                isComplete = false;
              }
              userResult.status = userStatus;
              $scope.results.resultList.push(userResult);
            }

            //concatenating the results in an array of strings for notify function
            var successes = [];
            var errors = [];
            var count_s = 0;
            var count_e = 0;
            for (var idx in $scope.results.resultList) {
              if ($scope.results.resultList[idx].status === 200) {
                successes[count_s] = $translate.instant('usersPage.emailSent', $scope.results.resultList[idx]);
                count_s++;
              } else if ($scope.results.resultList[idx].status === 304) {
                errors[count_e] = $translate.instant('usersPage.entitled', $scope.results.resultList[idx]);
                count_e++;
              } else if ($scope.results.resultList[idx].status === 403) {
                errors[count_e] = $translate.instant('usersPage.forbidden', $scope.results.resultList[idx]);
                count_e++;
              } else {
                errors[count_e] = $translate.instant('usersPage.emailFailed', $scope.results.resultList[idx]);
                count_e++;
              }
            }
            //Displaying notifications
            if (successes.length + errors.length === usersList.length) {
              $scope.btnInviteLoad = false;
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }

          } else {
            Log.error('Could not process invitation.  Status: ' + status, data);
            var error = [$translate.instant('usersPage.errInvite', data)];
            Notification.notify(error, 'error');
            isComplete = false;
            $scope.btnInviteLoad = false;
          }

          var msg = 'inviting ' + usersList.length + ' users...';
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), status, startLog, usersList.length, null);

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          $scope.btnInviteLoad = true;

          startLog = moment();

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            Userservice.inviteUsers(usersList, null, callback);
          }

        } else {
          Log.debug('No users entered.');
          var error = [$filter('translate')('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
        }

      };
    }
  ]);
