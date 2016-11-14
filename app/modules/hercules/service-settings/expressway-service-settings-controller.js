(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceSettingsController', ExpresswayServiceSettingsController);

  /* @ngInject */
  function ExpresswayServiceSettingsController($state, $modal, ServiceDescriptor, Authinfo, USSService, MailValidatorService, CertService, Notification, FusionUtils, CertificateFormatterService, $translate) {
    var vm = this;
    vm.emailSubscribers = '';
    vm.connectorType = $state.current.data.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.formattedCertificateList = [];
    vm.readCerts = readCerts;
    vm.localizedAddEmailWatermark = $translate.instant('hercules.settings.emailNotificationsWatermark');
    vm.enableEmailSendingToUser = false;
    vm.squaredFusionEc = false;
    vm.squaredFusionEcEntitled = Authinfo.isFusionEC();
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.' + vm.servicesId[0]);
    vm.localizedConnectorName = $translate.instant('hercules.connectorNames.' + vm.servicesId[0]);
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
              vm.squaredFusionEc = !vm.squaredFusionEc;
              Notification.errorWithTrackingId(err, 'hercules.errors.failedToEnableConnect');
            }
          }
        );
      }
      if (vm.squaredFusionEc) {
        readCerts();
      }
    };

    vm.loading = true;
    USSService.getOrg(Authinfo.getOrgId()).then(function (res) {
      vm.loading = false;
      vm.sipDomain = res.sipDomain;
      vm.org = res || {};
    }, function () {
      //  if (err) return notification.notify(err);
    });

    vm.updateSipDomain = function () {
      vm.savingSip = true;

      USSService.updateOrg(vm.org)
          .then(function () {
            vm.storeEc(false);
            vm.savingSip = false;
            Notification.success('hercules.errors.sipDomainSaved');
          })
            .catch(function (error) {
              vm.savingSip = false;
              Notification.errorWithTrackingId(error, 'hercules.errors.sipDomainInvalid');
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
            Notification.success('hercules.settings.emailNotificationsSavingSuccess');
          } else {
            Notification.error('hercules.settings.emailNotificationsSavingError');
          }
          vm.savingEmail = false;
        });
      }
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

    vm.uploadCert = function (file) {
      if (!file) {
        return;
      }
      CertService.uploadCert(Authinfo.getOrgId(), file)
        .then(readCerts)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
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
      CertService.getCerts(Authinfo.getOrgId())
        .then(function (res) {
          vm.certificates = res || [];
          vm.formattedCertificateList = CertificateFormatterService.formatCerts(vm.certificates);
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotRead');
        });
    }

  }

  /* @ngInject */
  function ConfirmCertificateDeleteController(CertService, $modalInstance, Notification, cert) {
    var vm = this;
    vm.cert = cert;
    vm.remove = function () {
      CertService.deleteCert(vm.cert.certId)
        .then($modalInstance.close)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotDelete');
        });
    };
  }

}());
