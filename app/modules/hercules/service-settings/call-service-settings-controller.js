(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CallServiceSettingsController', CallServiceSettingsController);

  /* @ngInject */
  function CallServiceSettingsController($modal, Analytics, ServiceDescriptorService, Authinfo, USSService, CertService, Notification, CertificateFormatterService, $translate, hasAtlasHybridCallDiagnosticTool, Orgservice, FeatureToggleService) {
    var vm = this;
    vm.formattedCertificateList = [];
    vm.readCerts = readCerts;
    vm.enableEmailSendingToUser = false;
    vm.squaredFusionEc = false;
    vm.squaredFusionEcEntitled = Authinfo.isFusionEC();
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.squared-fusion-uc');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNames.squared-fusion-uc');

    if (vm.squaredFusionEcEntitled) {
      ServiceDescriptorService.isServiceEnabled('squared-fusion-ec')
        .then(function (response) {
          vm.squaredFusionEc = response;
          if (vm.squaredFusionEc) {
            readCerts();
          }
        })
        .catch(function (response) {
          this.Notification.errorWithTrackingId(response, 'hercules.genericFailure');
        });
    }
    vm.help = {
      title: 'common.help',
    };
    vm.callServiceAware = {
      title: 'hercules.serviceNames.squared-fusion-uc.full',
    };

    vm.domainVerification = {
      title: 'hercules.settings.call.domainVerification',
    };
    vm.callServiceConnect = {
      title: 'hercules.serviceNames.squared-fusion-ec',
    };
    vm.showSIPTestTool = false;
    vm.nameChangeEnabled = false;
    vm.sipDestinationTestSucceeded = undefined;

    FeatureToggleService.atlas2017NameChangeGetStatus().then(function (toggle) {
      vm.nameChangeEnabled = toggle;
    });

    Orgservice.isTestOrg()
      .then(function (isTestOrg) {
        vm.showSIPTestTool = isTestOrg || hasAtlasHybridCallDiagnosticTool;
      });

    Analytics.trackHSNavigation(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CALL_SETTINGS);

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
          Notification.success('hercules.errors.sipDomainSaved');
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.errors.sipDomainInvalid');
        })
        .finally(function () {
          vm.savingSip = false;
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
        template: require('modules/hercules/service-settings/confirm-certificate-delete.html'),
        type: 'small',
        controller: 'ConfirmCertificateDeleteController',
        controllerAs: 'confirmCertificateDelete',
        resolve: {
          cert: function () {
            return cert;
          },
        },
      }).result
        .then(function () {
          Notification.success('hercules.settings.call.certificatesDeleted');
        })
        .finally(readCerts);
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

    /* Callback from the hs-enable-disable-call-service-connect component  */
    vm.onCallServiceConnectEnabled = function () {
      vm.squaredFusionEc = true;
      readCerts();
    };

    /* Callback from the hs-enable-disable-call-service-connect component  */
    vm.onCallServiceConnectDisabled = function () {
      vm.squaredFusionEc = false;
    };

    /* Callback from the verify-sip-destination component  */
    vm.onDestinationSave = function () {
      vm.updateSipDomain();
    };

    /* Callback from the verify-sip-destination component  */
    vm.onResultReady = function (succeeded, resultSet) {
      vm.sipDestinationTestSucceeded = succeeded;
      vm.sipDestinationTestResultSet = resultSet;
    };

    /* Callback from the verify-sip-destination component  */
    vm.onTestStarted = function () {
      vm.sipDestinationTestSucceeded = undefined;
    };

    vm.warnSipDestination = function () {
      return vm.sipDestinationTestSucceeded !== undefined && !vm.sipDestinationTestSucceeded;
    };

    vm.openSipTestResults = function () {
      $modal.open({
        resolve: {
          resultSet: function () { return vm.sipDestinationTestResultSet; },
        },
        controller: 'VerifySipDestinationModalController',
        controllerAs: 'vm',
        template: require('modules/hercules/service-settings/verify-sip-destination/verify-sip-destination-modal.html'),
        type: 'full',
      });
    };
  }
}());
