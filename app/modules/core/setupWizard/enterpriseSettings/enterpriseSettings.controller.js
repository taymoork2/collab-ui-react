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
    FeatureToggleService,
    Log,
    Notification,
    Orgservice,
    ServiceSetup,
    SSOService,
    SsoCertificateService,
    UrlConfig) {
    var strEntityDesc = '<EntityDescriptor ';
    var strEntityId = 'entityID="';
    var strEntityIdEnd = '"';
    $scope.updateSSO = updateSSO;
    $scope.isReadOnly = Authinfo.isReadOnlyAdmin();

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
    vm.sparkAssistantToggle = false;

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
        sparkAssistantToggle: FeatureToggleService.atlasSparkAssistantGetStatus(),
      }).then(function (toggles) {
        vm.sparkAssistantToggle = toggles.sparkAssistantToggle;
      });

      updateSSO();
    }
    init();

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
      isDisabled: $scope.isReadOnly,
    }, {
      label: $translate.instant('ssoModal.enableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoProvider',
      isDisabled: $scope.isReadOnly,
    }];

    $scope.SSOSelfSignedOptions = [{
      label: $translate.instant('ssoModal.requiredCertMetadata'),
      value: 0,
      name: 'ssoSelfSignedCert',
      id: 'ssoNoSelfSigned',
      isDisabled: $scope.isReadOnly,
    }, {
      label: $translate.instant('ssoModal.allowSelfCertMetadata'),
      value: 1,
      name: 'ssoSelfSignedCert',
      id: 'ssoSelfSigned',
      isDisabled: $scope.isReadOnly,
    }];

    $scope.enableSSOOptions = [{
      label: $translate.instant('ssoModal.finalEnableSSO'),
      value: 1,
      name: 'finalssoOptions',
      id: 'finalSsoProvider',
      isDisabled: $scope.isReadOnly,
    }, {
      label: $translate.instant('ssoModal.finalDisableSSO'),
      value: 0,
      name: 'finalssoOptions',
      id: 'finalSsoNoProvider',
      isDisabled: $scope.isReadOnly,
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

      return SsoCertificateService.getReqBinding(file);
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
            var testUrl = UrlConfig.getSSOTestUrl() + '?metaAlias=/' + Authinfo.getOrgId() + '/sp&idpEntityID=' + encodeURIComponent(entityId) + '&binding=' + SsoCertificateService.HTTP_POST_BINDINGS + reqBinding;
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
