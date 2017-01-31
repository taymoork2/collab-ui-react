(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CallServiceSettingsController', CallServiceSettingsController);

  /* @ngInject */
  function CallServiceSettingsController($modal, ServiceDescriptor, Authinfo, USSService, CertService, Notification, CertificateFormatterService, $translate, hasVoicemailFeatureToggle, UCCService) {
    var vm = this;
    vm.formattedCertificateList = [];
    vm.readCerts = readCerts;
    vm.enableEmailSendingToUser = false;
    vm.squaredFusionEc = false;
    vm.squaredFusionEcEntitled = Authinfo.isFusionEC();
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.squared-fusion-uc');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNames.squared-fusion-uc');
    if (vm.squaredFusionEcEntitled) {
      ServiceDescriptor.isServiceEnabled('squared-fusion-ec', function (a, b) {
        vm.squaredFusionEc = b;
        if (vm.squaredFusionEc) {
          readCerts();
        }
      });
    }
    vm.hasVoicemailFeatureToggle = hasVoicemailFeatureToggle;
    vm.help = {
      title: 'common.help'
    };
    vm.callServiceAware = {
      title: 'hercules.serviceNames.squared-fusion-uc.full'
    };

    vm.domainVerification = {
      title: 'hercules.settings.call.domainVerification'
    };
    vm.callServiceConnect = {
      title: 'hercules.serviceNames.squared-fusion-ec'
    };

    vm.storeEc = function (toggleConnect) {
      if (!toggleConnect) {
        ServiceDescriptor.enableService('squared-fusion-ec')
          .then(function () {
            readCerts();
            Notification.success('hercules.notifications.connect.connectEnabled');
          })
          .catch(function (response) {
            vm.squaredFusionEc = false;
            Notification.errorWithTrackingId(response, 'hercules.errors.failedToEnableConnect');
          });
      } else {
        ServiceDescriptor.disableService('squared-fusion-ec').then(function () {
          Notification.success('hercules.notifications.connect.connectDisabled');
          if (hasVoicemailFeatureToggle) {
            vm.disableVoicemail(Authinfo.getOrgId());
          }
        }).catch(function (response) {
          Notification.errorWithTrackingId(response, 'hercules.error.failedToDisableConnect');
        });
      }
    };

    vm.disableVoicemail = function (orgId) {
      UCCService.getOrgVoicemailConfiguration(orgId)
        .then(function (data) {
          if (data.voicemailOrgEnableInfo.orgHybridVoicemailEnabled) {
            UCCService.disableHybridVoicemail(orgId)
              .then(function () {
                Notification.success('hercules.settings.voicemail.disableDescription');
              })
            .catch(function (response) {
              Notification.errorWithTrackingId(response, 'hercules.voicemail.voicemailDisableError');
            });
          }
        });
    };

    vm.loading = true;
    USSService.getOrg(Authinfo.getOrgId())
      .then(function (res) {
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
          vm.savingSip = false;
          Notification.success('hercules.errors.sipDomainSaved');
        })
        .catch(function (error) {
          vm.savingSip = false;
          Notification.errorWithTrackingId(error, 'hercules.errors.sipDomainInvalid');
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
        controller: 'ConfirmCertificateDeleteController',
        controllerAs: 'confirmCertificateDelete',
        resolve: {
          cert: function () {
            return cert;
          }
        }
      }).result
        .then(readCerts);
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
}());
