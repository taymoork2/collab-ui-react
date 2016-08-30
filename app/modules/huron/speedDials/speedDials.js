(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('SpeedDialsCtrl', SpeedDialsCtrl);

  function SpeedDialsCtrl($translate, $stateParams, $scope, $modal, $timeout, dragularService, SpeedDialsService, Notification) {
    var speedDials = this;
    speedDials.currentUser = $stateParams.currentUser;
    if (_.has(speedDials, 'currentUser') && _.has(speedDials.currentUser, 'id')) {
      SpeedDialsService.getSpeedDials(speedDials.currentUser.id).then(function (data) {
        speedDials.speedDialList = data.speedDials;
      }, function () {
        Notification.error('speedDials.retrieveSpeedDialsFail');
      });
    }
    speedDials.editing = false;
    speedDials.reordering = false;
    var firstReordering = true;
    speedDials.labelMessages = {
      required: $translate.instant('common.invalidRequired'),
      pattern: $translate.instant('speedDials.labelIncorrectCharacter')
    };
    speedDials.numberMessages = {
      required: $translate.instant('common.invalidRequired'),
      pattern: $translate.instant('common.incorrectFormat')
    };
    speedDials.reachSpeedDialLimit = function () {
      if (_.has(speedDials.speedDialList, 'length')) {
        return speedDials.speedDialList.length >= 125;
      }
      return false;
    };
    speedDials.add = function () {
      var sd = {
        index: speedDials.speedDialList.length + 1,
        label: '',
        number: ''
      };
      speedDials.speedDialList.push(sd);
      speedDials.setEdit(sd);
      $timeout(function () {
        $('#sd-' + sd.index).focus();
      }, 100);
    };

    speedDials.setEdit = function (sd) {
      if (_.isObject(sd) && _.has(sd, 'label') && _.has(sd, 'number')) {
        speedDials.editing = true;
        sd.edit = true;
        speedDials.newLabel = sd.label;
        speedDials.newNumber = sd.number;
      }
    };

    speedDials.setReorder = function () {
      speedDials.reordering = true;
      speedDials.copyList = angular.copy(speedDials.speedDialList);
      if (firstReordering) {
        firstReordering = false;
        dragularService('#speedDialContainer', {
          classes: {
            transit: 'sd-reorder-transit'
          },
          containersModel: [speedDials.speedDialList],
          moves: function () {
            return speedDials.reordering;
          }
        });
      }
    };

    speedDials.delete = function (sd) {
      $modal.open({
        templateUrl: 'modules/huron/speedDials/deleteConfirmation.tpl.html',
        type: 'dialog',
        scope: $scope
      }).result.then(function () {
        speedDials.speedDialList.splice(sd.index - 1, 1);
        updateIndex();
        SpeedDialsService.updateSpeedDials(speedDials.currentUser.id, speedDials.speedDialList).then(function () {
        }, function () {
          Notification.error('speedDials.speedDialChangesFailed');
        });
      });
    };

    function updateIndex() {
      _.each(speedDials.speedDialList, function (sd, index) {
        sd.index = index + 1;
      });
    }

    speedDials.reset = function () {
      if (speedDials.editing) {
        var sd = _.find(speedDials.speedDialList, {
          'edit': true
        });
        if (_.isEmpty(sd.label) || _.isEmpty(sd.number)) {
          //Create case: remove last element
          speedDials.speedDialList.pop();
        } else {
          //Update case: go back to read only mode
          sd.edit = false;
        }
        speedDials.newLabel = '';
        speedDials.newNumber = '';
      } else if (speedDials.reordering) {
        speedDials.speedDialList.length = 0;
        Array.prototype.push.apply(speedDials.speedDialList, angular.copy(speedDials.copyList));
      }
      speedDials.editing = false;
      speedDials.reordering = false;
    };

    speedDials.save = function () {
      if (speedDials.editing) {
        var sd = _.find(speedDials.speedDialList, {
          'edit': true
        });
        sd.edit = false;
        sd.label = speedDials.newLabel;
        sd.number = speedDials.newNumber.replace(/ /g, '');
        speedDials.newLabel = '';
        speedDials.newNumber = '';
      } else if (speedDials.reordering) {
        updateIndex();
        speedDials.copyList = undefined;
      }
      SpeedDialsService.updateSpeedDials(speedDials.currentUser.id, speedDials.speedDialList).then(function () {
        speedDials.reordering = false;
        speedDials.editing = false;
      }, function () {
        Notification.error('speedDials.speedDialChangesFailed');
        if (_.has(speedDials, 'currentUser') && _.has(speedDials.currentUser, 'id')) {
          SpeedDialsService.getSpeedDials(speedDials.currentUser.id).then(function (data) {
            speedDials.speedDialList = data.speedDials;
          }, function () {
            Notification.error('speedDials.retrieveSpeedDialsFail');
          });
        }
        speedDials.reordering = false;
        speedDials.editing = false;
      });
    };
  }
})();
