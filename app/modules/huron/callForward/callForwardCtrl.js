'use strict';


angular.module('Huron')
  .controller('callForwardInfoCtrl', ['$scope', '$q', '$http', 'UserDirectoryNumberDetailService', 'Log', 'Config', 'Notification', '$filter', 'Storage',
      function($scope, $q, $http, UserDirectoryNumberDetailService, Log, Config, Notification, $filter, Storage) {
        $scope.forward = 'busy';
        $scope.forwardAllCalls = '';
        $scope.forwardBusyCalls = '';
        $scope.forwardNoAnswerCalls = '';
        $scope.forwardExternalBusyCalls = '';
        $scope.forwardExternalNoAnswerCalls = '';
        $scope.forwardExternalCalls = false;
        $scope.validForwardOptions = ['Add New'];
        $scope.forwardOptions = [];

        $scope.changeForwardAllCalls = function() {
          var exists = false;

          if ($scope.forwardAllCalls !== 'Voicemail' || $scope.forwardAllCalls !== 'Add New') {
            for (var j=0; j< $scope.validForwardOptions.length; j++) {
              if($scope.validForwardOptions[j] === $scope.forwardAllCalls) {
                exists = true;
              }
            }
            if (!exists) {
              $scope.validForwardOptions.push($scope.forwardAllCalls);
              $scope.forwardOptions.push($scope.forwardAllCalls);
            }
          }
        };

        $scope.selectForwardAllCalls = function(value) {
          if (value !== 'Add New') {
            $scope.forwardAllCalls = value;
          } else {
            $scope.forwardAllCalls = '';
          }
        };

        $scope.changeForwardBusyCalls = function() {
          var exists = false;

          if ($scope.forwardBusyCalls !== 'Voicemail' || $scope.forwardBusyCalls !== 'Add New') {
            for (var j=0; j< $scope.validForwardOptions.length; j++) {
              if($scope.validForwardOptions[j] === $scope.forwardBusyCalls) {
                exists = true;
              }
            }
            if (!exists) {
              $scope.validForwardOptions.push($scope.forwardBusyCalls);
              $scope.forwardOptions.push($scope.forwardBusyCalls);
            }
          }
        };

        $scope.selectForwardBusyCalls = function(value) {
          if (value !== 'Add New') {
            $scope.forwardBusyCalls = value;
          } else {
            $scope.forwardBusyCalls = '';
          }
        };

        $scope.changeForwardNoAnswerCalls = function() {
          var exists = false;

          if ($scope.forwardNoAnswerCalls !== 'Voicemail' || $scope.forwardNoAnswerCalls !== 'Add New') {
            for (var j=0; j< $scope.validForwardOptions.length; j++) {
              if($scope.validForwardOptions[j] === $scope.forwardNoAnswerCalls) {
                exists = true;
              }
            }
            if (!exists) {
              $scope.validForwardOptions.push($scope.forwardNoAnswerCalls);
              $scope.forwardOptions.push($scope.forwardNoAnswerCalls);
            }
          }
        };

        $scope.selectForwardNoAnswerCalls = function(value) {
          if (value !== 'Add New') {
            $scope.forwardNoAnswerCalls = value;
          } else {
            $scope.forwardNoAnswerCalls = '';
          }
        };

        $scope.changeForwardExternalBusyCalls = function() {
          var exists = false;

          if ($scope.forwardExternalBusyCalls !== 'Voicemail' || $scope.forwardExternalBusyCalls !== 'Add New') {
            for (var j=0; j< $scope.validForwardOptions.length; j++) {
              if($scope.validForwardOptions[j] === $scope.forwardExternalBusyCalls) {
                exists = true;
              }
            }
            if (!exists) {
              $scope.validForwardOptions.push($scope.forwardExternalBusyCalls);
              $scope.forwardOptions.push($scope.forwardExternalBusyCalls);
            }
          }
        };

        $scope.selectForwardExternalBusyCalls = function(value) {
          if (value !== 'Add New') {
            $scope.forwardExternalBusyCalls = value;
          } else {
            $scope.forwardExternalBusyCalls = '';
          }
        };

        $scope.changeForwardExternalNoAnswerCalls = function() {
          var exists = false;

          if ($scope.forwardExternalNoAnswerCalls !== 'Voicemail' || $scope.forwardExternalNoAnswerCalls !== 'Add New') {
            for (var j=0; j< $scope.validForwardOptions.length; j++) {
              if($scope.validForwardOptions[j] === $scope.forwardExternalNoAnswerCalls) {
                exists = true;
              }
            }
            if (!exists) {
              $scope.validForwardOptions.push($scope.forwardExternalNoAnswerCalls);
              $scope.forwardOptions.push($scope.forwardExternalNoAnswerCalls);
            }
          }
        };

        $scope.selectForwardExternalNoAnswerCalls = function(value) {
          if (value !== 'Add New') {
            $scope.forwardExternalNoAnswerCalls = value;
          } else {
            $scope.forwardExternalNoAnswerCalls = '';
          }
        };

        $scope.isCallForwardSelected = function(value) {
          if ($scope.forward === value) {
            return true;
          } else {
            return false;
          }
        };

        $scope.saveCallForward = function() {
          //if the form has changed save those changes
          //if ($scope.callForwardForm.$dirty) {
            Storage.put('forwardOptions', $scope.forwardOptions);
            $scope.applyChangesDirectoryNumber();
            $scope.updateDirectoryNumberDetails($scope.currentUser);
          //}
          };

        $scope.updateDirectoryNumberDetails = function (user) {
          var deferred = $q.defer();
          var directoryNumberPUT = angular.copy($scope.directoryNumberDetail);
          var result = {
            msg: null,
            type: 'null'
          };

          // TODO: Remove the following line when we are authenticating with CMI
          delete $http.defaults.headers.common.Authorization;

          delete directoryNumberPUT.customer;
          delete directoryNumberPUT.uuid;
          
          UserDirectoryNumberDetailService.update({customerId: user.meta.organizationID, directoryNumberId: $scope.directoryNumberDetail.uuid}, directoryNumberPUT,
            function (data) {
              deferred.resolve(data);
              result.msg = $filter('translate')('callForwardPanel.success');
              result.type = 'success';
              Notification.notify([result.msg], result.type);
            }, function (error) {
              Log.debug('getDirectoryNumberDetails failed.  Status: ' + error.status + ' Response: ' + error.data);
              result.msg = $filter('translate')('callForwardPanel.error') + error.data;
              result.type = 'error';
              Notification.notify([result.msg], result.type);
              deferred.reject(error);
            });
          return deferred.promise;
        };

        $scope.$watch('telephonyUser', function(newVal, oldVal) {
          if (newVal) {
            if ($scope.validForwardOptions === null || $scope.validForwardOptions === undefined) {
              $scope.validForwardOptions = ['Add New'];
            }

            if ($scope.isVoicemailEnabled()) {
              var exists = false;
              for (var j=0; j< $scope.validForwardOptions.length; j++) {
                if($scope.validForwardOptions[j] === 'Voicemail') {
                  exists = true;
                }
              }
              if (!exists) {
                $scope.validForwardOptions.push('Voicemail');
              }
            }

            $scope.forwardOptions = Storage.get('forwardOptions');
            if ($scope.forwardOptions === null || $scope.forwardOptions === undefined) {
              $scope.forwardOptions = [];
            } else {
              var options = $scope.forwardOptions.split(',');
              for (var i=0; i< options.length; i++) {
                $scope.validForwardOptions.push(options[i]);
              }
            }
          }
        });

        $scope.$watch('directoryNumberDetail', function(newVal, oldVal) {
          if (newVal) {
            if ($scope.directoryNumberDetail.callForwardAll.voicemailEnabled === 'true' || ($scope.directoryNumberDetail.callForwardAll.destination !== null && $scope.directoryNumberDetail.callForwardAll.destination !== undefined)) {
              $scope.forward = 'all';
            } else {
              if ($scope.directoryNumberDetail.callForwardBusy.intVoicemailEnabled === 'true' || ($scope.directoryNumberDetail.callForwardBusy.destination !== null && $scope.directoryNumberDetail.callForwardBusy.destination !== undefined)) {
                $scope.forward = 'busy';
                if (($scope.directoryNumberDetail.callForwardBusy.voicemailEnabled !== $scope.directoryNumberDetail.callForwardNoAnswer.voicemailEnabled) || ($scope.directoryNumberDetail.callForwardBusy.destination !== $scope.directoryNumberDetail.callForwardNoAnswer.destination)) {
                  $scope.forwardExternalCalls = true;
                }
              }
            }
          }

          if ($scope.directoryNumberDetail.callForwardAll.voicemailEnabled === 'true') {
            $scope.forwardAllCalls = 'Voicemail';
          } else {
            $scope.forwardAllCalls = $scope.directoryNumberDetail.callForwardAll.destination;
          }
          if ($scope.directoryNumberDetail.callForwardBusy.intVoicemailEnabled === 'true') {
            $scope.forwardBusyCalls = 'Voicemail';
          } else {
            $scope.forwardBusyCalls = $scope.directoryNumberDetail.callForwardBusy.intDestination;
            $scope.forwardExternalBusyCalls = $scope.directoryNumberDetail.callForwardBusy.destination;
          }
          if ($scope.directoryNumberDetail.callForwardNoAnswer.voicemailEnabled === 'true') {
            $scope.forwardNoAnswerCalls = 'Voicemail';
          } else {
            $scope.forwardNoAnswerCalls = $scope.directoryNumberDetail.callForwardNoAnswer.intDestination;
            $scope.forwardExternalNoAnswerCalls = $scope.directoryNumberDetail.callForwardNoAnswer.destination;
          }

        });

        $scope.$parent.$on('saveLineSettings', function(event, args) {
          $scope.saveCallForward();
        });

        $scope.applyChangesDirectoryNumber = function() {
          if ($scope.forward === 'all') {
            if ($scope.forwardAllCalls === 'Voicemail') {
              $scope.directoryNumberDetail.callForwardAll.voicemailEnabled = true;
            } else {
              $scope.directoryNumberDetail.callForwardAll.voicemailEnabled = false;
              $scope.directoryNumberDetail.callForwardAll.destination = $scope.forwardAllCalls;
            }
          } else {
            $scope.directoryNumberDetail.callForwardAll.voicemailEnabled = false;
            $scope.directoryNumberDetail.callForwardAll.destination = '';
            if ($scope.forwardExternalCalls) {
              if ($scope.forwardBusyCalls === 'Voicemail') {
                $scope.directoryNumberDetail.callForwardBusy.intVoiceMailEnabled = true;
                $scope.directoryNumberDetail.callForwardNotRegistered.intVoiceMailEnabled = true;
              } else {
                $scope.directoryNumberDetail.callForwardBusy.intVoiceMailEnabled = false;
                $scope.directoryNumberDetail.callForwardBusy.intDestination = $scope.forwardBusyCalls;
                $scope.directoryNumberDetail.callForwardNotRegistered.intVoiceMailEnabled = false;
                $scope.directoryNumberDetail.callForwardNotRegistered.intDestination = $scope.forwardBusyCalls; 
              }
              if ($scope.forwardNoAnswerCalls === 'Voicemail') {
                $scope.directoryNumberDetail.callForwardNoAnswer.intVoiceMailEnabled = true;
              } else {
                $scope.directoryNumberDetail.callForwardNoAnswer.intVoiceMailEnabled = false;
                $scope.directoryNumberDetail.callForwardNoAnswer.intDestination = $scope.forwardNoAnswerCalls;
              }
              if ($scope.forwardExternalBusyCalls === 'Voicemail') {
                $scope.directoryNumberDetail.callForwardBusy.voicemailEnabled = true;
                $scope.directoryNumberDetail.callForwardNotRegistered.voicemailEnabled = true;
              } else {
                $scope.directoryNumberDetail.callForwardBusy.voicemailEnabled = false;
                $scope.directoryNumberDetail.callForwardNotRegistered.voicemailEnabled = false;
                $scope.directoryNumberDetail.callForwardBusy.destination = $scope.forwardExternalBusyCalls;
                $scope.directoryNumberDetail.callForwardNotRegistered.destination = $scope.forwardExternalBusyCalls;
              }
              if ($scope.forwardExternalNoAnswerCalls === 'Voicemail') {
                $scope.directoryNumberDetail.callForwardNoAnswer.voicemailEnabled = true;
              } else {
                $scope.directoryNumberDetail.callForwardNoAnswer.voicemailEnabled = false;
                $scope.directoryNumberDetail.callForwardNoAnswer.destination = $scope.forwardExternalNoAnswerCalls;
              }
            } else {
              if ($scope.forwardBusyCalls === 'Voicemail') {
                $scope.directoryNumberDetail.callForwardBusy.intVoiceMailEnabled = true;
                $scope.directoryNumberDetail.callForwardBusy.voicemailEnabled = true;
                $scope.directoryNumberDetail.callForwardNoAnswer.intVoiceMailEnabled = true;
                $scope.directoryNumberDetail.callForwardNoAnswer.voicemailEnabled = true;
                $scope.directoryNumberDetail.callForwardNotRegistered.intVoiceMailEnabled = true;
                $scope.directoryNumberDetail.callForwardNotRegistered.voicemailEnabled = true;
              } else {
                $scope.directoryNumberDetail.callForwardNotRegistered.intVoiceMailEnabled = false;
                $scope.directoryNumberDetail.callForwardNotRegistered.voicemailEnabled = false;
                $scope.directoryNumberDetail.callForwardBusy.intVoiceMailEnabled = false;
                $scope.directoryNumberDetail.callForwardBusy.voicemailEnabled = false;
                $scope.directoryNumberDetail.callForwardBusy.intDestination = $scope.forwardBusyCalls;
                $scope.directoryNumberDetail.callForwardBusy.destination = $scope.forwardBusyCalls;

                $scope.directoryNumberDetail.callForwardNoAnswer.intVoiceMailEnabled = false;
                $scope.directoryNumberDetail.callForwardNoAnswer.voicemailEnabled = false;
                $scope.directoryNumberDetail.callForwardNoAnswer.intDestination = $scope.forwardNoAnswerCalls;
                $scope.directoryNumberDetail.callForwardNoAnswer.destination = $scope.forwardNoAnswerCalls;
                $scope.directoryNumberDetail.callForwardNotRegistered.intDestination = $scope.forwardBusyCalls;
                $scope.directoryNumberDetail.callForwardNotRegistered.destination = $scope.forwardNoAnswerCalls;
              }
            }
          }
        };
        
      }]);
  