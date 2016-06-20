(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CommunicationsCtrl', CommunicationsCtrl);

  /* @ngInject */
  function CommunicationsCtrl($scope, $translate, AccountOrgService, Authinfo, Notification) {
    var vm = this;
    vm.cloudSipFlag = false;

    var orgId = Authinfo.getOrgId();
    AccountOrgService.getOrgSettings(orgId)
      .success(function (data, status) {
        var index = _.findIndex(data.settings, function (obj) {
          return obj.key == 'orgCloudSipUri';
        });
        if (index > -1) {
          vm.cloudSipUriField = data.settings[index].value.replace('.ciscospark.com', '');
          vm.cloudSipFlag = true;
        }
      });

    $scope.$on('wizard-claim-sip-uri-event', function () {
      var orgId = Authinfo.getOrgId();

      if (!_.isEmpty(vm.cloudSipUriField) && !vm.cloudSipFlag) {
        AccountOrgService.addOrgCloudSipUri(orgId, vm.cloudSipUriField)
          .success(function (data, status) {
            Notification.notify([$translate.instant('firstTimeWizard.cloudSipSuccess')], 'success');
          })
          .error(function (data, status) {
            Notification.notify([$translate.instant('firstTimeWizard.cloudSipError')], 'error');
          });
      }

    });

  }
})();
