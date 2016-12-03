(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CalendarSettingsController', CalendarSettingsController);


  /* @ngInject */
  function CalendarSettingsController($modal, $translate, $state, MailValidatorService, Notification, ServiceDescriptor) {
    var vm = this;
    vm.localizedAddEmailWatermark = $translate.instant('hercules.settings.emailNotificationsWatermark');
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.squared-fusion-cal');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNames.squared-fusion-cal');

    vm.general = {
      title: 'common.general'
    };

    vm.deactivateSection = {
      title: 'common.deactivate'
    };

    vm.documentationSection = {
      title: 'common.help'
    };

    ServiceDescriptor.getEmailSubscribers('squared-fusion-cal', function (error, emailSubscribers) {
      if (!error) {
        vm.emailSubscribers = _.map(_.without(emailSubscribers.split(','), ''), function (user) {
          return {
            text: user
          };
        });
      } else {
        vm.emailSubscribers = [];
      }
    });

    vm.writeConfig = function () {
      var emailSubscribers = _.map(vm.emailSubscribers, function (data) {
        return data.text;
      }).toString();
      if (emailSubscribers && !MailValidatorService.isValidEmailCsv(emailSubscribers)) {
        Notification.error('hercules.errors.invalidEmail');
      } else {
        vm.savingEmail = true;
        ServiceDescriptor.setEmailSubscribers('squared-fusion-cal', emailSubscribers, function (statusCode) {
          if (statusCode === 204) {
            Notification.success('hercules.settings.emailNotificationsSavingSuccess');
          } else {
            Notification.error('hercules.settings.emailNotificationsSavingError');
          }
          vm.savingEmail = false;
        });
      }
    };

    function init() {
      ServiceDescriptor.getDisableEmailSendingToUser()
        .then(function (calSvcDisableEmailSendingToEndUser) {
          vm.enableEmailSendingToUser = !calSvcDisableEmailSendingToEndUser;
        });
    }
    init();

    vm.writeEnableEmailSendingToUser = _.debounce(function (value) {
      ServiceDescriptor.setDisableEmailSendingToUser(value)
        .catch(function (error) {
          vm.enableEmailSendingToUser = !vm.enableEmailSendingToUser;
          return Notification.errorWithTrackingId(error, 'hercules.settings.emailUserNotificationsSavingError');
        });
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    vm.setEnableEmailSendingToUser = function () {
      vm.writeEnableEmailSendingToUser(vm.enableEmailSendingToUser);
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: 'modules/hercules/service-settings/confirm-disable-dialog.html',
        type: 'small',
        controller: 'ConfirmDisableController',
        controllerAs: 'confirmDisableDialog',
        resolve: {
          serviceId: function () {
            return serviceId;
          }
        }
      }).result.then(function () {
        $state.go('services-overview');
      });
    };
  }
}());
