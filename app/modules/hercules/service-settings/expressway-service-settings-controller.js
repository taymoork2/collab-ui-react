(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceSettingsController', ExpresswayServiceSettingsController);

  /* @ngInject */
  function ExpresswayServiceSettingsController($state, $modal, ServiceDescriptor, Authinfo, USSService2, MailValidatorService, XhrNotificationService, CertService, Notification, FusionUtils, CertificateFormatterService, $translate) {
    var vm = this;
    vm.emailSubscribers = '';
    vm.connectorType = $state.current.data.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.formattedCertificateList = [];
    vm.readCerts = readCerts;
    vm.localizedAddEmailWatermark = $translate.instant('hercules.settings.emailNotificationsWatermark');

    vm.squaredFusionEc = false;
    vm.squaredFusionEcEntitled = Authinfo.isFusionEC();
    if (vm.squaredFusionEcEntitled) {
      ServiceDescriptor.isServiceEnabled('squared-fusion-ec', function (a, b) {
        vm.squaredFusionEc = b;
        if (vm.squaredFusionEc) {
          readCerts();
        }
      });
    }

    vm.storeEc = function (onlyDisable) {
      if ((onlyDisable && !vm.squaredFusionEc) || !onlyDisable) {
        // Only store when disabling. The enabling is done in the Save button handler
        // need this hack because the switch call backs twice, every time the user clicks it:
        // one time with the old value, one time with the new value
        ServiceDescriptor.setServiceEnabled('squared-fusion-ec', vm.squaredFusionEc,
          function (err) {
            // TODO: fix this callback crap!
            if (err) {
              XhrNotificationService.notify('Failed to enable Aware');
            }
          }
        );
      }
      if (vm.squaredFusionEc) {
        readCerts();
      }
    };

    vm.loading = true;
    USSService2.getOrg(Authinfo.getOrgId()).then(function (res) {
      vm.loading = false;
      vm.sipDomain = res.sipDomain;
      vm.org = res || {};
    }, function (err) {
      //  if (err) return notification.notify(err);
    });

    vm.updateSipDomain = function () {
      vm.savingSip = true;

      USSService2.updateOrg(vm.org).then(function (res) {
        vm.storeEc(false);
        vm.savingSip = false;
      }, function (err) {
        vm.savingSip = false;
        Notification.error('hercules.errors.sipDomainInvalid');
      });
    };

    ServiceDescriptor.getEmailSubscribers(vm.servicesId[0], function (error, emailSubscribers) {
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
        ServiceDescriptor.setEmailSubscribers(vm.servicesId[0], emailSubscribers, function (statusCode) {
          if (statusCode === 204) {
            Notification.success($translate.instant('hercules.settings.emailNotificationsSavingSuccess'));
          } else {
            Notification.error($translate.instant('hercules.settings.emailNotificationsSavingError'));
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

    vm.enableEmailSendingToUser = false;
    init();

    vm.writeEnableEmailSendingToUser = _.debounce(function (value) {
      ServiceDescriptor.setDisableEmailSendingToUser(value);
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    vm.setEnableEmailSendingToUser = function () {
      vm.writeEnableEmailSendingToUser(vm.enableEmailSendingToUser);
    };

    vm.disableService = function (serviceId) {
      ServiceDescriptor.setServiceEnabled(serviceId, false, function (error) {
        // TODO: Strange callback result ???
        if (error !== null) {
          XhrNotificationService.notify(error);
        } else {
          $state.go('overview'); // once F410 goes public, let's go to to 'services-overview' instead.
        }
      });
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: 'modules/hercules/service-settings/confirm-disable-dialog.html',
        type: 'small',
        controller: DisableConfirmController,
        controllerAs: 'disableConfirmDialog',
        resolve: {
          serviceId: function () {
            return serviceId;
          }
        }
      }).result.then(function () {
        vm.disableService(serviceId);
      });
    };

    vm.uploadCert = function (file) {
      if (!file) {
        return;
      }
      CertService.uploadCert(Authinfo.getOrgId(), file).then(readCerts, XhrNotificationService.notify);
    };

    vm.confirmCertDelete = function (cert) {
      $modal.open({
        templateUrl: 'modules/hercules/service-settings/confirm-certificate-delete.html',
        type: 'small',
        controller: ConfirmCertificateDeleteController,
        controllerAs: 'confirmCertificateDelete',
        resolve: {
          cert: function () {
            return cert;
          }
        }
      }).result.then(readCerts);
    };

    function readCerts() {
      CertService.getCerts(Authinfo.getOrgId()).then(function (res) {
        vm.certificates = res || [];
        vm.formattedCertificateList = CertificateFormatterService.formatCerts(vm.certificates);
      }, XhrNotificationService.notify);
    }

    vm.invalidEmail = function (tag) {
      Notification.error(tag.text + ' is not a valid email');
    };
  }

  /* @ngInject */
  function DisableConfirmController(FusionUtils, $modalInstance, serviceId) {
    var modalVm = this;
    modalVm.serviceId = serviceId;
    modalVm.serviceIconClass = FusionUtils.serviceId2Icon(serviceId);

    modalVm.ok = function () {
      $modalInstance.close();
    };
    modalVm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  /* @ngInject */
  function ConfirmCertificateDeleteController(CertService, $modalInstance, XhrNotificationService, cert) {
    var vm = this;
    vm.cert = cert;
    vm.remove = function () {
      CertService.deleteCert(vm.cert.certId).then($modalInstance.close, XhrNotificationService.notify);
    };
    vm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

}());
