var XmlService = require('modules/core/shared/xml-service/xml-service.service').XmlService;

(function () {
  'use strict';

  angular.module('Core')
    .controller('EnterpriseSettingsCtrl', EnterpriseSettingsCtrl);

  /* @ngInject */
  function EnterpriseSettingsCtrl(
    $modal,
    $q,
    $rootScope,
    $scope,
    $timeout,
    $translate,
    $window,
    Authinfo,
    Config,
    FeatureToggleService,
    Log,
    Notification,
    Orgservice,
    PersonalMeetingRoomManagementService,
    ServiceSetup,
    SSOService,
    UrlConfig) {
    var strEntityDesc = '<EntityDescriptor ';
    var strEntityId = 'entityID="';
    var strEntityIdEnd = '"';
    var _BINDINGS = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';
    $scope.updateSSO = updateSSO;

    $scope.options = {
      configureSSO: 1,
      enableSSORadioOption: null,
      SSOSelfSigned: 0,
      modifySSO: false,
      deleteSSOBySwitchingRadio: false,
    };

    var DEFAULT_TZ = {
      id: 'America/Los_Angeles',
      label: $translate.instant('timeZones.America/Los_Angeles'),
    };
    var vm = this;
    vm.sipUpdateToggle = false;
    vm.sparkAssistantToggle = false;

    vm.pmrField = {
      inputValue: '',
      isDisabled: false,
      isAvailable: false,
      isButtonDisabled: false,
      isLoading: false,
      isConfirmed: null,
      availableUrlValue: '',
      isRoomLicensed: false,
      domainSuffix: UrlConfig.getSparkDomainCheckUrl(),
      errorMsg: $translate.instant('firstTimeWizard.setPersonalMeetingRoomInputFieldErrorMessage'),
    };

    var pmrField = vm.pmrField;
    vm.timeZoneOptions = [];
    vm._buildTimeZoneOptions = _buildTimeZoneOptions;
    vm.loadTimeZoneOptions = loadTimeZoneOptions;
    vm.model = {
      site: {
        timeZone: DEFAULT_TZ,
      },
    };

    vm.timeZoneSelection = [{
      model: vm.model.site,
      key: 'timeZone',
      type: 'select',
      templateOptions: {
        inputClass: 'medium-5',
        label: $translate.instant('serviceSetupModal.timeZone'),
        options: [],
        labelfield: 'label',
        valuefield: 'id',
        inputPlaceholder: $translate.instant('serviceSetupModal.searchTimeZone'),
        filter: true,
      },
      controller: /* @ngInject */ function ($scope) {
        _buildTimeZoneOptions($scope);
        loadTimeZoneOptions();
      },
    }];

    function init() {
      $q.all({
        sipUpdateToggle: FeatureToggleService.atlasSubdomainUpdateGetStatus(),
        sparkAssistantToggle: FeatureToggleService.atlasSparkAssistantGetStatus(),
      }).then(function (toggles) {
        vm.sipUpdateToggle = toggles.sipUpdateToggle;
        vm.sparkAssistantToggle = toggles.sparkAssistantToggle;
      });

      setPMRSiteUrlFromSipDomain();
      updateSSO();
    }
    init();

    // Personal Meeting Room Controller code

    function setPMRSiteUrlFromSipDomain() {
      var pmrSiteUrl = '';
      var params = {
        basicInfo: true,
      };
      Orgservice.getOrg(function (data, status) {
        if (status === 200) {
          var sparkDomainStr = UrlConfig.getSparkDomainCheckUrl();
          var sipCloudDomain = _.get(data.orgSettings, 'sipCloudDomain');
          pmrSiteUrl = sipCloudDomain ? data.orgSettings.sipCloudDomain.replace(sparkDomainStr, Config.siteDomainUrl.webexUrl) : '';
          Orgservice.validateSiteUrl(pmrSiteUrl).then(function (response) {
            if (response.isValid) {
              pmrField.inputValue = pmrSiteUrl.replace(Config.siteDomainUrl.webexUrl, '');
              pmrField.isAvailable = true;
              pmrField.availableUrlValue = pmrField.inputValue;
              pmrField.isError = false;
            } else {
              pmrField.inputValue = '';
            }
          });
        }
      }, null, params);
    }

    vm.checkPMRSiteUrlAvailability = function () {
      var pmrSiteUrl = pmrField.inputValue + Config.siteDomainUrl.webexUrl;
      pmrField.isAvailable = false;
      pmrField.isLoading = true;
      pmrField.isButtonDisabled = true;
      pmrField.errorMsg = $translate.instant('firstTimeWizard.setPersonalMeetingRoomInputFieldErrorMessage');
      return Orgservice.validateSiteUrl(pmrSiteUrl)
        .then(function (response) {
          if (response.isValid) {
            pmrField.isAvailable = true;
            pmrField.availableUrlValue = pmrField.inputValue;
            pmrField.isError = false;
          } else {
            pmrField.isError = true;
            pmrField.isButtonDisabled = false;
          }
          pmrField.isLoading = false;
        })
        .catch(function (response) {
          if (response.status === 400) {
            pmrField.errorMsg = $translate.instant('firstTimeWizard.personalMeetingRoomServiceErrorMessage');
            pmrField.isError = true;
          } else {
            Notification.errorWithTrackingId(response, 'firstTimeWizard.personalMeetingRoomServiceErrorMessage');
          }
          pmrField.isLoading = false;
          pmrField.isButtonDisabled = false;
        });
    };

    vm._savePersonalMeetingRoomSiteUrl = function () {
      var url = pmrField.inputValue;
      if (pmrField.isAvailable && pmrField.isConfirmed) {
        PersonalMeetingRoomManagementService.addPmrSiteUrl(url)
          .then(function () {
            pmrField.isError = false;
            pmrField.isDisabled = true;
            pmrField.isButtonDisabled = true;
            Notification.success('firstTimeWizard.setPersonalMeetingRoomSuccessMessage');
            $rootScope.$broadcast('DISMISS_PMR_NOTIFICATION');
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'firstTimeWizard.personalMeetingRoomServiceErrorMessage');
          });
      }
    };

    $scope.$on('wizard-enterprise-pmr-event', $scope._savePersonalMeetingRoomSiteUrl);

    vm.validatePmrSiteUrl = function () {
      if (pmrField.inputValue.length > 40) {
        pmrField.isError = true;
      }

      return pmrField.isError;
    };

    vm.onPmrInputChange = function (inputValue) {
      if (inputValue !== pmrField.availableUrlValue && !pmrField.isDisabled) {
        pmrField.isAvailable = false;
        pmrField.isError = false;
        pmrField.isButtonDisabled = false;
        pmrField.isConfirmed = false;
      } else if (inputValue === pmrField.availableUrlValue) {
        pmrField.isAvailable = true;
      }
    };

    // SSO controller code

    function updateSSO() {
      //ssoEnabled should be set already in the userCard.js
      $scope.ssoEnabled = $rootScope.ssoEnabled || false;
      if ($scope.ssoEnabled) {
        $scope.options.configureSSO = 0;
      }
    }

    $scope.handleModify = function () {
      $scope.options.modifySSO = true;
    };

    $scope.configureSSOOptions = [{
      label: $translate.instant('ssoModal.disableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoNoProvider',
    }, {
      label: $translate.instant('ssoModal.enableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoProvider',
    }];

    $scope.SSOSelfSignedOptions = [{
      label: $translate.instant('ssoModal.requiredCertMetadata'),
      value: 0,
      name: 'ssoSelfSignedCert',
      id: 'ssoNoSelfSigned',
    }, {
      label: $translate.instant('ssoModal.allowSelfCertMetadata'),
      value: 1,
      name: 'ssoSelfSignedCert',
      id: 'ssoSelfSigned',
    }];

    $scope.enableSSOOptions = [{
      label: $translate.instant('ssoModal.finalEnableSSO'),
      value: 1,
      name: 'finalssoOptions',
      id: 'finalSsoProvider',
    }, {
      label: $translate.instant('ssoModal.finalDisableSSO'),
      value: 0,
      name: 'finalssoOptions',
      id: 'finalSsoNoProvider',
    }];

    $scope.$watch('options.configureSSO', function (updatedConfigureSSOValue) {
      vm.changeSSO(updatedConfigureSSOValue);
    });

    vm.changeSSO = function (updatedConfigureSSOValue) {
      if ($rootScope.ssoEnabled && updatedConfigureSSOValue === 1) {
        // Check if emails are suppressed or not
        var params = {
          basicInfo: true,
          disableCache: false,
        };
        Orgservice.getAdminOrgAsPromise(null, params).then(function (response) {
          var isOnBoardingEmailSuppressed = response.data.isOnBoardingEmailSuppressed || false;
          $modal.open({
            template: require('modules/core/setupWizard/enterpriseSettings/ssoDisableConfirm.tpl.html'),
            type: 'dialog',
            controller: function () {
              var vm = this;
              vm.message = isOnBoardingEmailSuppressed
                ? $translate.instant('ssoModal.disableSSOByRadioWarningWhenEmailsSuppressed')
                : $translate.instant('ssoModal.disableSSOByRadioWarning');
            },
            controllerAs: 'vm',
          }).result.then(function () {
            $scope.options.configureSSO = 1;
            $scope.options.deleteSSOBySwitchingRadio = true;
            // Set the email suppress state to FALSE when the SSO is disabled
            Orgservice.setOrgEmailSuppress(false).then(function () {
              deleteSSO();
            }).catch(_.noop);
          }).catch(function () {
            $scope.options.modifySSO = false; //reset modify flag if user clicks cancel
            $scope.options.configureSSO = 0;
            $scope.options.deleteSSOBySwitchingRadio = false;
          });
        });
      }
    };

    $scope.$watch('options.enableSSORadioOption', function () {
      var ssoValue = $scope.options.enableSSORadioOption;
      if (ssoValue !== 'null') {
        _.set($scope.wizard, 'isNextDisabled', false);
      }
    });

    $scope.initNext = function () {
      var deferred = $q.defer();
      if (_.isFunction(_.get($scope, 'wizard.nextTab')) && $scope.ssoEnabled) {
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

    $scope.testSSONext = function () {
      var ssoValue = $scope.options.enableSSORadioOption;
      if (ssoValue === 0) {
        deleteSSO();
      } else if (ssoValue === 1) {
        reEnableSSO();
      }
    };

    $scope.idpFile = {};
    $scope.$watch('idpFile.file', function () {
      if ($scope.idpFile.file) {
        if ($rootScope.ssoEnabled) {
          $modal.open({
            template: require('modules/core/setupWizard/enterpriseSettings/ssoDisableConfirm.tpl.html'),
            type: 'dialog',
            controller: function () {
              var vm = this;
              vm.message = $translate.instant('ssoModal.idpOverwriteWarning');
            },
            controllerAs: 'vm',
          }).result.then(function () {
            $timeout($scope.importRemoteIdp);
          }).catch(function () {
            //reset
            resetFile();
          });
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
      SSOService.getMetaInfo(function (data, status) {
        if (data.success) {
          if (data.data.length > 0) {
            //check if data already exists for this entityId
            var newEntityId = checkNewEntityId(data);
            var metaData = _.get(data, 'data[0]', {}); // pick a better name
            if (metaData.entityId === newEntityId) {
              patchRemoteIdp(metaData.url);
            } else {
              SSOService.deleteMeta(metaData.url, function (response) {
                var status = response.status;
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
            status: status,
          });
        }
      });
    }

    function deleteSSO() {
      var selfSigned = !!$scope.options.SSOSelfSigned;
      var metaUrl = null;
      var success = true;
      SSOService.getMetaInfo(function (data, status, response) {
        $scope.wizard.wizardNextLoad = true;
        if (data.success && data.data.length > 0) {
          //check if data already exists for this entityId
          metaUrl = _.get(data, 'data[0].url');
          if (metaUrl) {
            //call patch with sso false
            SSOService.patchRemoteIdp(metaUrl, null, selfSigned, false, function (data, status, response) {
              if (data.success) {
                //patch success so delete metadata
                SSOService.deleteMeta(metaUrl, function (response) {
                  var status = response.status;
                  if (status !== 204) {
                    success = false;
                  }
                  if (success === true) {
                    if ($scope.options.deleteSSOBySwitchingRadio) {
                      Notification.success('ssoModal.ssoDisableSuccessNotification');
                      $scope.ssoEnabled = false;
                    } else {
                      Log.debug('Single Sign-On (SSO) successfully disabled for all users');
                      $scope.wizard.nextTab();
                    }
                    $rootScope.ssoEnabled = false;
                  } else {
                    Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
                    Notification.errorWithTrackingId(response, 'ssoModal.disableFailed', {
                      status: status,
                    });
                  }
                });
              } else {
                Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
                Notification.errorWithTrackingId(response, 'ssoModal.disableFailed', {
                  status: status,
                });
              }
            });
          }
        } else {
          Log.debug('Failed to retrieve meta url. Status: ' + status);
          Notification.errorWithTrackingId(response, 'ssoModal.disableFailed', {
            status: status,
          });
        }
        $scope.wizard.wizardNextLoad = false;
      });
    }

    function _buildTimeZoneOptions(localScope) {
      localScope.$watchCollection(function () {
        return vm.timeZoneOptions;
      }, function (timeZones) {
        localScope.to.options = timeZones;
      });
    }

    function loadTimeZoneOptions() {
      return ServiceSetup.getTimeZones()
        .then(function (timeZones) {
          vm.timeZoneOptions = ServiceSetup.getTranslatedTimeZones(timeZones);
        });
    }

    function reEnableSSO() {
      var selfSigned = !!$scope.options.SSOSelfSigned;
      var metaUrl = null;
      SSOService.getMetaInfo(function (data) {
        $scope.wizard.wizardNextLoad = true;
        if (data.success && data.data.length > 0) {
          //check if data already exists for this entityId
          var newEntityId = checkNewEntityId(data);
          metaUrl = _.get(_.find(data.data, {
            entityId: newEntityId,
          }), 'url');
          if (metaUrl) {
            SSOService.patchRemoteIdp(metaUrl, $rootScope.fileContents, selfSigned, true, function (data, status, response) {
              if (data.success) {
                Log.debug('Single Sign-On (SSO) successfully enabled for all users');
                $scope.ssoEnabled = true;
                $rootScope.ssoEnabled = true;
                $scope.wizard.nextTab();
              } else {
                Log.debug('Failed to enable Single Sign-On (SSO). Status: ' + status);
                Notification.errorWithTrackingId(response, 'ssoModal.enableSSOFailure', {
                  status: status,
                });
              }
            });
          }
        } else {
          SSOService.importRemoteIdp($scope.idpFile.file, selfSigned, true, function (data, status, response) {
            if (data.success) {
              Log.debug('Single Sign-On (SSO) successfully enabled for all users');
              $rootScope.ssoEnabled = true;
              $scope.ssoEnabled = true;
              $scope.wizard.nextTab();
            } else {
              Log.debug('Failed to enable Single Sign-On (SSO). Status: ' + status);
              Notification.errorWithTrackingId(response, 'ssoModal.enableSSOFailure', {
                status: status,
              });
            }
          });
        }
      });
    }

    function postRemoteIdp() {
      var selfSigned = !!$scope.options.SSOSelfSigned;
      SSOService.importRemoteIdp($scope.idpFile.file, selfSigned, false, function (data, status) {
        if (data.success) {
          Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.success = true;
        } else {
          Log.debug('Failed to Import On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.error = true;
          $scope.idpFile.errorMsg = $translate.instant('ssoModal.importFailed', {
            status: status,
          });
        }
      });
    }

    function patchRemoteIdp(metaUrl) {
      var selfSigned = !!$scope.options.SSOSelfSigned;
      SSOService.patchRemoteIdp(metaUrl, $scope.idpFile.file, selfSigned, false, function (data, status) {
        if (data.success) {
          Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.success = true;
        } else {
          Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
          $scope.idpFile.error = true;
          $scope.idpFile.errorMsg = $translate.instant('ssoModal.importFailed', {
            status: status,
          });
        }
      });
    }

    function checkNewEntityId() {
      var file = _.get($scope, 'idpFile.file');
      if (_.isString(file)) {
        var start = file.indexOf(strEntityDesc);
        start = file.indexOf(strEntityId, start) + strEntityId.length;
        var end = file.indexOf(strEntityIdEnd, start);
        var newEntityId = file.substring(start, end);
        return newEntityId;
      }
    }

    function checkReqBinding() {
      var file = _.get($scope, 'idpFile.file');
      if (!_.isString(file)) {
        return '';
      }

      var xmlService = new XmlService();
      return xmlService.getReqBinding(file);
    }

    $scope.openTest = function () {
      var entityId;
      var reqBinding;
      $scope.testOpened = true;
      SSOService.getMetaInfo(function (data, status, response) {
        if (data.success) {
          if (data.data.length > 0) {
            entityId = data.data[0].entityId;
            reqBinding = checkReqBinding();
          }
          if (entityId) {
            var testUrl = UrlConfig.getSSOTestUrl() + '?metaAlias=/' + Authinfo.getOrgId() + '/sp&idpEntityID=' + encodeURIComponent(entityId) + '&binding=' + _BINDINGS + reqBinding;
            $window.open(testUrl);
          } else {
            Log.debug('Retrieved null Entity id. Status: ' + status);
            Notification.errorWithTrackingId(response, 'ssoModal.retrieveEntityIdFailed', {
              status: status,
            });
          }
        } else {
          Log.debug('Failed to retrieve entity id. Status: ' + status);
          Notification.errorWithTrackingId(response, 'ssoModal.retrieveEntityIdFailed', {
            status: status,
          });
        }
      });
    };

    $scope.downloadHostedSp = function () {
      SSOService.downloadHostedSp(function (data, status) {
        if (data.success) {
          $scope.metaFilename = 'idb-meta-' + Authinfo.getOrgId() + '-SP.xml';
          var content = data.metadataXml;
          var blob = new $window.Blob([content], {
            type: 'text/xml',
          });
          $scope.url = ($window.URL || $window.webkitURL).createObjectURL(blob);
        } else {
          Log.debug('Failed to Export Identity Broker SP Metadata. Status: ' + status);
        }
      });
    };
  }
})();
