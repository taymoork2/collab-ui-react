(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CallServiceSettingsController', CallServiceSettingsController);

  /* @ngInject */
  function CallServiceSettingsController($modal, ServiceDescriptor, Authinfo, USSService, CertService, Notification, CertificateFormatterService, $translate) {
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

}());
