(function () {
  'use strict';

  angular.module('Core')
    .controller('EnterpriseSettingsCtrl', EnterpriseSettingsCtrl);

  /* @ngInject */
  function EnterpriseSettingsCtrl($scope, $rootScope, $q, $timeout, SSOService, Orgservice, SparkDomainManagementService, Authinfo, Log, Notification, $translate, $window, Config, UrlConfig) {
    var strEntityDesc = '<EntityDescriptor ';
    var strEntityId = 'entityID="';
    var strEntityIdEnd = '"';
    var oldSSOValue = 0;
    $scope.updateSSO = updateSSO;

    //SIP URI Domain Controller code
    $scope.cloudSipUriField = {
      inputValue: '',
      isDisabled: false,
      isUrlAvailable: false,
      isButtonDisabled: false,
      isLoading: false,
      isConfirmed: null,
      urlValue: '',
      isRoomLicensed: false,
      domainSuffix: UrlConfig.getSparkDomainCheckUrl(),
      errorMsg: $translate.instant('firstTimeWizard.setSipUriErrorMessage')
    };

    $scope.options = {
      configureSSO: 1,
      enableSSORadioOption: null,
      SSOSelfSigned: 0,
      modifySSO: false,
      deleteSSOBySwitchingRadio: false
    };

    var sipField = $scope.cloudSipUriField;
    init();

    function init() {
      checkRoomLicense();
      setSipUri();
      updateSSO();
    }

    function updateSSO() {
      //ssoEnabled should be set already in the userCard.js
      $scope.ssoEnabled = $rootScope.ssoEnabled || false;
      if ($rootScope.ssoEnabled) {
        $scope.options.configureSSO = 0;
      }
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
          if (data.orgSettings.sipCloudDomain) {
            displayName = data.orgSettings.sipCloudDomain.replace(sparkDomainStr, '');
            sipField.isDisabled = true;
            sipField.isButtonDisabled = true;
          } else if (data.verifiedDomains) {
            if (_.isArray(data.verifiedDomains)) {
              displayName = data.verifiedDomains[0].split(/[^A-Za-z]/)[0].toLowerCase();
            }
          } else if (data.displayName) {
            displayName = data.displayName.split(/[^A-Za-z]/)[0].toLowerCase();
          }
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

    $scope.handleModify = function () {
      $scope.options.modifySSO = true;
    };

    $scope.configureSSOOptions = [{
      label: $translate.instant('ssoModal.disableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoNoProvider'
    }, {
      label: $translate.instant('ssoModal.enableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoProvider'
    }];

    $scope.SSOSelfSignedOptions = [{
      label: $translate.instant('ssoModal.requiredCertMetadata'),
      value: 0,
      name: 'ssoSelfSignedCert',
      id: 'ssoNoSelfSigned'
    }, {
      label: $translate.instant('ssoModal.allowSelfCertMetadata'),
      value: 1,
      name: 'ssoSelfSignedCert',
      id: 'ssoSelfSigned'
    }];

    $scope.enableSSOOptions = [{
      label: $translate.instant('ssoModal.finalEnableSSO'),
      value: 1,
      name: 'finalssoOptions',
      id: 'finalSsoProvider'
    }, {
      label: $translate.instant('ssoModal.finalDisableSSO'),
      value: 0,
      name: 'finalssoOptions',
      id: 'finalSsoNoProvider'
    }];

    $scope.$watch('options.configureSSO', function (updatedConfigureSSOValue) {
      if ($rootScope.ssoEnabled && updatedConfigureSSOValue === 1) {
        var r = confirm($translate.instant('ssoModal.disableSSOByRadioWarning'));
        if (r === true) {
          $scope.options.configureSSO = 1;
          //$scope.options.modifySSO = true;
          $scope.options.deleteSSOBySwitchingRadio = true;
          deleteSSO();
        } else {
          $scope.options.modifySSO = false; //reset modify flag if user clicks cancel
          $scope.options.configureSSO = 0;
          $scope.options.deleteSSOBySwitchingRadio = false;
        }
      }
    });

    $scope.$watch('options.enableSSORadioOption', function () {
      var ssoValue = $scope.options.enableSSORadioOption;
      if (ssoValue !== 'null') {
        _.set($scope.wizard, 'isNextDisabled', false);
      }
    });

    $scope.$on('wizard-set-sso-event', function () {
      var ssoValue = $scope.options.enableSSORadioOption;
      if (ssoValue === 0) {
        deleteSSO();
      } else if (ssoValue === 1) {
        reEnableSSO();
      }
    });

    $scope.initNext = function () {
      var deferred = $q.defer();
      if (angular.isDefined($scope.wizard) && angular.isFunction($scope.wizard.nextTab) && (angular.isDefined($scope.ssoEnabled) && $scope.ssoEnabled)) {
        //sso is on and next is clicked without modify
        if (!$scope.options.modifySSO) {
          deferred.reject();
          $scope.wizard.nextTab();
        } else {
          //sso is on and modify is clicked
          if ($scope.options.deleteSSOBySwitchingRadio) {
            //switch is made from advanced to simple, next should take to next Tab
            deferred.reject();
            $scope.wizard.nextTab();
            $scope.options.modifySSO = false; //reset modify flag
          } else {
            //no switch made, user needs to update idp Metadata, next should take to next Step
            deferred.resolve();
            $scope.options.modifySSO = false; //reset modify flag
          }
        }
      } else {
        //sso is disabled, and user clicks next
        if ($scope.options.configureSSO === 1) {
          //simple option is chosen, go to nextTab
          deferred.reject();
          $scope.wizard.nextTab();
        } else {
          //advanced option is chosen, go to next step
          deferred.resolve();
        }
      }
      return deferred.promise;
    };

    $scope.idpFile = {};
    $scope.$watch('idpFile.file', function (value) {
      if ($scope.idpFile.file) {
        if ($rootScope.ssoEnabled) {
          var r = confirm($translate.instant('ssoModal.idpOverwriteWarning'));
          if (r == true) {
            $timeout($scope.importRemoteIdp);
          } else {
            //reset
            resetFile();
          }
        } else {
          //sso is not enabled.Import the idp file
          $timeout($scope.importRemoteIdp);
        }
      }
    });

    $scope.resetFile = resetFile;

    function resetFile() {
      $scope.idpFile = {};
    }
    $scope.importRemoteIdp = importRemoteIdp;

    function importRemoteIdp() {
      var metaUrl = null;
      SSOService.getMetaInfo(function (data, status) {
        if (data.success) {
          if (data.data.length > 0) {
            //check if data already exists for this entityId
            var newEntityId = checkNewEntityId(data);
            var metaData = _.get(data, 'data[0]', {}); // pick a better name
            if (metaData.entityId === newEntityId) {
              patchRemoteIdp(metaData.url);
            } else {
              SSOService.deleteMeta(metaData.url, function (status) {
                if (status === 204) {
                  postRemoteIdp();
                }
              });
            }
          } else {
            postRemoteIdp();
          }
        } else {
          Log.debug('Failed to retrieve meta url. Status: ' + status);
          $scope.idpFile.error = true;
          $scope.idpFile.errorMsg = $translate.instant('ssoModal.importFailed', {
            status: status
          });
        }
      });
    }

    function deleteSSO() {
      var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
      var metaUrl = null;
      var success = true;
      SSOService.getMetaInfo(function (data, status) {
        $scope.wizard.wizardNextLoad = true;
        if (data.success && data.data.length > 0) {
          //check if data already exists for this entityId
          metaUrl = _.get(data, 'data[0].url');
          if (metaUrl) {
            //call patch with sso false
            SSOService.patchRemoteIdp(metaUrl, null, false, function (data, status) {
              if (data.success) {
                //patch success so delete metadata
                SSOService.deleteMeta(metaUrl, function (status) {
                  if (status !== 204) {
                    success = false;
                  }
                  if (success === true) {
                    if ($scope.options.deleteSSOBySwitchingRadio) {
                      Notification.success($translate.instant('ssoModal.ssoDisableSuccessNotification'));
                      $scope.ssoEnabled = false;
                    } else {
                      Log.debug('Single Sign-On (SSO) successfully disabled for all users');
                      $scope.wizard.nextTab();
                    }
                    $rootScope.ssoEnabled = false;
                  } else {
                    Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
                    Notification.error('ssoModal.disableFailed', {
                      status: status
                    });
                  }
                });
              } else {
                Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
                Notification.error('ssoModal.disableFailed', {
                  status: status
                });

              }
            });
          }
        } else {
          Log.debug('Failed to retrieve meta url. Status: ' + status);
          Notification.error('ssoModal.disableFailed', {
            status: status
          });
        }
        $scope.wizard.wizardNextLoad = false;
      });
    }

    function reEnableSSO() {
      var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
      var metaUrl = null;
      SSOService.getMetaInfo(function (data, status) {
        $scope.wizard.wizardNextLoad = true;
        if (data.success && data.data.length > 0) {
          //check if data already exists for this entityId
          var newEntityId = checkNewEntityId(data);
          metaUrl = _.get(_.find(data.data, {
            entityId: newEntityId
          }), 'url');
          if (metaUrl) {
            SSOService.patchRemoteIdp(metaUrl, $rootScope.fileContents, true, function (data, status) {
              if (data.success) {
                Log.debug('Single Sign-On (SSO) successfully enabled for all users');
                $scope.ssoEnabled = true;
                $rootScope.ssoEnabled = true;
                $scope.wizard.nextTab();
              } else {
                Log.debug('Failed to enable Single Sign-On (SSO). Status: ' + status);
                Notification.error('ssoModal.enableSSOFailure', {
                  status: status
                });
              }
            });
          }
        } else {
          SSOService.importRemoteIdp($scope.idpFile.file, selfSigned, true, function (data, status) {
            if (data.success) {
              Log.debug('Single Sign-On (SSO) successfully enabled for all users');
              $rootScope.ssoEnabled = true;
              $scope.ssoEnabled = true;
              $scope.wizard.nextTab();
            } else {
              Log.debug('Failed to enable Single Sign-On (SSO). Status: ' + status);
              Notification.error('ssoModal.enableSSOFailure', {
                status: status
              });
            }
          });
        }
      });
    }

    function postRemoteIdp() {
      var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
      SSOService.importRemoteIdp($scope.idpFile.file, selfSigned, false, function (data, status) {
        if (data.success) {
          Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.success = true;
        } else {
          Log.debug('Failed to Import On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.error = true;
          $scope.idpFile.errorMsg = $translate.instant('ssoModal.importFailed', {
            status: status
          });
        }
      });
    }

    function patchRemoteIdp(metaUrl) {
      SSOService.patchRemoteIdp(metaUrl, $scope.idpFile.file, false, function (data, status) {
        if (data.success) {
          Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.success = true;
        } else {
          Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.error = true;
          $scope.idpFile.errorMsg = $translate.instant('ssoModal.importFailed', {
            status: status
          });
        }
      });
    }

    function checkNewEntityId(data) {
      var start = $scope.idpFile.file.indexOf(strEntityDesc);
      start = $scope.idpFile.file.indexOf(strEntityId, start) + strEntityId.length;
      var end = $scope.idpFile.file.indexOf(strEntityIdEnd, start);
      var newEntityId = $scope.idpFile.file.substring(start, end);
      return newEntityId;
    }

    $scope.openTest = function () {
      var entityId = null;
      $scope.testOpened = true;
      SSOService.getMetaInfo(function (data, status) {
        if (data.success) {
          if (data.data.length > 0) {
            entityId = data.data[0].entityId;
          }
          if (entityId !== null) {
            var testUrl = UrlConfig.getSSOTestUrl() + '?metaAlias=/' + Authinfo.getOrgId() + '/sp&idpEntityID=' + encodeURIComponent(entityId) + '&binding=urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST&requestBinding=urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';
            $window.open(testUrl);
          } else {
            Log.debug('Retrieved null Entity id. Status: ' + status);
            Notification.error('ssoModal.retrieveEntityIdFailed', {
              status: status
            });
          }
        } else {
          Log.debug('Failed to retrieve entity id. Status: ' + status);
          Notification.error('ssoModal.retrieveEntityIdFailed', {
            status: status
          });
        }
      });

    };

    $scope.downloadHostedSp = function () {
      SSOService.downloadHostedSp(function (data, status) {
        if (data.success) {
          $scope.metaFilename = 'idb-meta-' + Authinfo.getOrgId() + '-SP.xml';
          var content = data.metadataXml;
          var blob = new Blob([content], {
            type: 'text/xml'
          });
          $scope.url = (window.URL || window.webkitURL).createObjectURL(blob);
        } else {
          Log.debug('Failed to Export Identity Broker SP Metadata. Status: ' + status);
        }
      });
    };
  }
})();
