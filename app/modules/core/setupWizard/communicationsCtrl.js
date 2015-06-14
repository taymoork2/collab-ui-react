(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CommunicationsCtrl', CommunicationsCtrl);

  /* @ngInject */
  function CommunicationsCtrl($log, $scope, AccountOrgService, Authinfo, Notification, Orgservice) {
    var vm = this;
    vm.cloudSipFlag = false;
    vm.isTestOrg = false;
    /*jshint validthis: true */

    var orgId = Authinfo.getOrgId();
    AccountOrgService.getOrgSettings(orgId, function (data, status) {
      if (status === 200) {
        var index = _.findIndex(data.settings, function (obj) {
          return obj.key == 'orgCloudSipUri';
        });
        if (index > -1) {
          vm.cloudSipUriField = data.settings[index].value.replace('.ciscospark.com', '');
          vm.cloudSipFlag = true;
        }
      }
    });

    Orgservice.getOrg(function (data, status) {
      if (data.success) {
        vm.isTestOrg = data.isTestOrg;
      }
    });

    $scope.$on('wizard-claim-sip-uri-event', function () {

      var orgId = Authinfo.getOrgId();

      if (!_.isEmpty(vm.cloudSipUriField) && !vm.cloudSipFlag) {

        AccountOrgService.addOrgCloudSipUri(orgId, vm.cloudSipUriField, function (data, status) {
          if (status === 204) {
            Notification.notify(['Successfully added Cloud Sip URI.'], 'success');
          } else {
            Notification.notify(['Failed to add Cloud Sip URI.'], 'error');
          }
        });
      }

    });

  }
})();
