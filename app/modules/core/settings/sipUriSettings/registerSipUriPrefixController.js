(function () {
  'use strict';

  angular.module('Core')
    .controller('RegisterSipUriPrefixCtrl', RegisterSipUriPrefixCtrl);

  /* @ngInject */
  function RegisterSipUriPrefixCtrl($scope, $rootScope, $q, $timeout, SSOService, Orgservice, SparkDomainManagementService, Authinfo, Log, Notification, $translate, $window, Config, UrlConfig) {
    var strEntityDesc = '<EntityDescriptor ';
    var strEntityId = 'entityID="';
    var strEntityIdEnd = '"';
    var oldSSOValue = 0;

    //SIP URI Domain Controller code
    $scope.cloudSipUriField = {
      inputValue: '',
      isDisabled: true,
      isUrlAvailable: false,
      isButtonDisabled: false,
      isSipUriRegistered: false,
      isLoading: false,
      isConfirmed: null,
      urlValue: '',
      isRoomLicensed: false,
      domainSuffix: UrlConfig.getSparkDomainCheckUrl(),
      errorMsg: $translate.instant('firstTimeWizard.setSipUriErrorMessage')
    };

    var sipField = $scope.cloudSipUriField;
    init();

    function init() {
      checkRoomLicense();
      setSipUri();
    }

    function checkRoomLicense() {
      Orgservice.getLicensesUsage().then(function (response) {
        var licenses = _.get(response, '[0].licenses');
        var roomLicensed = _.find(licenses, {
          offerName: 'SD'
        });
        sipField.isRoomLicensed = !_.isUndefined(roomLicensed);
      });
    }

    function setSipUri() {
      Orgservice.getOrg(function (data, status) {
        var displayName = '';
        var sparkDomainStr = UrlConfig.getSparkDomainCheckUrl();
        if (status === 200) {
          var isAlreadyRegistered = false;
          if (data.orgSettings.sipCloudDomain) {
            displayName = data.orgSettings.sipCloudDomain.replace(sparkDomainStr, '');
            sipField.isButtonDisabled = true;
            sipField.isSipUriRegistered = true;
            isAlreadyRegistered = true;
          } else if (data.verifiedDomains) {
            if (_.isArray(data.verifiedDomains)) {
              displayName = data.verifiedDomains[0].split(/[^A-Za-z]/)[0].toLowerCase();
            }
          } else if (data.displayName) {
            displayName = data.displayName.split(/[^A-Za-z]/)[0].toLowerCase();
          }
          sipField.isDisabled = isAlreadyRegistered;
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
          Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
        }
        sipField.inputValue = displayName;
      }, false, true);
    }

    $scope.checkSipUriAvailability = function () {
      var domain = sipField.inputValue;
      sipField.isUrlAvailable = false;
      sipField.isLoading = true;
      sipField.isButtonDisabled = true;
      sipField.errorMsg = $translate.instant('firstTimeWizard.setSipUriErrorMessage');
      return SparkDomainManagementService.checkDomainAvailability(domain)
        .then(function (response) {
          if (response.data.isDomainAvailable) {
            sipField.isUrlAvailable = true;
            sipField.urlValue = sipField.inputValue;
            sipField.isError = false;
          } else {
            sipField.isError = true;
            sipField.isButtonDisabled = false;
          }
          sipField.isLoading = false;
        })
        .catch(function (response) {
          if (response.status === 400) {
            sipField.errorMsg = $translate.instant('firstTimeWizard.setSipUriErrorMessageInvalidDomain');
            sipField.isError = true;
          } else {
            Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
          }
          sipField.isLoading = false;
          sipField.isButtonDisabled = false;
        });
    };

    $scope._saveDomain = function () {
      var domain = sipField.inputValue;
      if (sipField.isUrlAvailable && sipField.isConfirmed) {
        SparkDomainManagementService.addSipUriDomain(domain)
          .then(function (response) {
            if (response.data.isDomainReserved) {
              sipField.isError = false;
              sipField.isDisabled = true;
              sipField.isButtonDisabled = true;
              sipField.isSipUriRegistered = true;
              Notification.success('firstTimeWizard.setSipUriDomainSuccessMessage');
              $rootScope.$broadcast('DISMISS_SIP_NOTIFICATION');
            }
          })
          .catch(function (response) {
            Notification.error('firstTimeWizard.sparkDomainManagementServiceErrorMessage');
          });
      }
    };

    $scope.$on('wizard-enterprise-sip-url-event', $scope._saveDomain);

    $scope.validateSipUri = function () {
      if (sipField.inputValue.length > 40) {
        sipField.isError = true;
      }

      return sipField.isError;
    };

    $scope.$watch('cloudSipUriField.inputValue', function (newValue, oldValue) {
      if (newValue !== sipField.urlValue && !sipField.isDisabled) {
        sipField.isUrlAvailable = false;
        sipField.isError = false;
        sipField.isButtonDisabled = false;
        sipField.isConfirmed = false;
      }
    });
  }
})();
