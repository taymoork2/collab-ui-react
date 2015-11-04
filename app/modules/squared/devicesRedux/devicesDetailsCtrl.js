(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('DevicesReduxDetailsCtrl', DevicesReduxDetailsCtrl);

  /* @ngInject */
  function DevicesReduxDetailsCtrl($stateParams, $state, $window, RemDeviceModal, Utils, CsdmDeviceService, CsdmCodeService, Authinfo, FeedbackService, XhrNotificationService) {
    var vm = this;

    if ($stateParams.device) {
      vm.device = $stateParams.device;
    } else {
      $state.go('devices-redux.search');
    }

    vm.tags = {
      createTag: function (device, $event) {
        var tag = _.trim(vm.tags.newTag);
        if ($event.keyCode == 13 && tag && !_.contains(device.tags, tag)) {
          vm.tags.newTag = undefined;
          return (device.needsActivation ? CsdmCodeService : CsdmDeviceService)
            .updateTags(device.url, device.tags.concat(tag))
            .catch(XhrNotificationService.notify);
        }
      },
      removeTag: function (device, tag) {
        var tags = _.without(device.tags, tag);
        return (device.needsActivation ? CsdmCodeService : CsdmDeviceService)
          .updateTags(device.url, tags)
          .catch(XhrNotificationService.notify);
      }
    };

    vm.deviceProps = {
      software: 'Software',
      ip: 'IP',
      serial: 'Serial',
      mac: 'Mac'
    };

    vm.reportProblem = function () {
      var feedbackId = Utils.getUUID();

      return CsdmDeviceService.uploadLogs(vm.device.url, feedbackId, Authinfo.getPrimaryEmail())
        .then(function () {
          var appType = 'Atlas_' + $window.navigator.userAgent;
          return FeedbackService.getFeedbackUrl(appType, feedbackId);
        })
        .then(function (res) {
          $window.open(res.data.url, '_blank');
        })
        .catch(XhrNotificationService.notify);
    };

    vm.deleteDevice = function () {
      RemDeviceModal
        .open(vm.device)
        .then(function () {
          $state.go('devices-redux.search');
        });
    };

  }
})();
