(function () {
  'use strict';

  angular.module('Core')
    .controller('EnterpriseSettingsCtrl', EnterpriseSettingsCtrl);

  /* @ngInject */
  function EnterpriseSettingsCtrl($scope, $rootScope, $q, $timeout, SSOService, Authinfo, Log, Notification, $translate, $window, UrlConfig) {
    var strEntityDesc = '<EntityDescriptor ';
    var strEntityId = 'entityID="';
    var strEntityIdEnd = '"';
    var strSignOn = 'SingleSignOnService';
    var strLocation = 'Location';
    var _BINDINGS = 'urn:oasis:names:tc:SAML:2.0:bindings:';
    var bindingStr = 'Binding="' + _BINDINGS;
    var strBindingEnd = '" ';
    $scope.updateSSO = updateSSO;

    $scope.options = {
      configureSSO: 1,
      enableSSORadioOption: null,
      SSOSelfSigned: 0,
      modifySSO: false,
      deleteSSOBySwitchingRadio: false
    };

    init();

    function init() {
      updateSSO();
    }

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
        var r = $window.confirm($translate.instant('ssoModal.disableSSOByRadioWarning'));
        if (r === true) {
          $scope.options.configureSSO = 1;
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
          if ($window.confirm($translate.instant('ssoModal.idpOverwriteWarning'))) {
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
            SSOService.patchRemoteIdp(metaUrl, null, selfSigned, false, function (data, status) {
              if (data.success) {
                //patch success so delete metadata
                SSOService.deleteMeta(metaUrl, function (status) {
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
      SSOService.getMetaInfo(function (data) {
        $scope.wizard.wizardNextLoad = true;
        if (data.success && data.data.length > 0) {
          //check if data already exists for this entityId
          var newEntityId = checkNewEntityId(data);
          metaUrl = _.get(_.find(data.data, {
            entityId: newEntityId
          }), 'url');
          if (metaUrl) {
            SSOService.patchRemoteIdp(metaUrl, $rootScope.fileContents, selfSigned, true, function (data, status) {
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
      var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
      SSOService.patchRemoteIdp(metaUrl, $scope.idpFile.file, selfSigned, false, function (data, status) {
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

    function checkNewEntityId() {
      var start = $scope.idpFile.file.indexOf(strEntityDesc);
      start = $scope.idpFile.file.indexOf(strEntityId, start) + strEntityId.length;
      var end = $scope.idpFile.file.indexOf(strEntityIdEnd, start);
      var newEntityId = $scope.idpFile.file.substring(start, end);
      return newEntityId;
    }

    function checkReqBinding() {
      var start = $scope.idpFile.file.indexOf(strSignOn);
      start = $scope.idpFile.file.indexOf(bindingStr, start);
      var end = $scope.idpFile.file.indexOf(strLocation, start) - strBindingEnd.length;
      var reqBinding = $scope.idpFile.file.substring(start + bindingStr.length, end);
      return reqBinding;
    }

    $scope.openTest = function () {
      var entityId = null;
      $scope.testOpened = true;
      SSOService.getMetaInfo(function (data, status) {
        if (data.success) {
          if (data.data.length > 0) {
            entityId = data.data[0].entityId;
            var reqBinding = checkReqBinding(data);
          }
          if (entityId !== null) {
            var testUrl = UrlConfig.getSSOTestUrl() + '?metaAlias=/' + Authinfo.getOrgId() + '/sp&idpEntityID=' + encodeURIComponent(entityId) + '&binding=' + _BINDINGS + 'HTTP-POST&reqBinding=' + _BINDINGS + reqBinding;
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
          var blob = new $window.Blob([content], {
            type: 'text/xml'
          });
          $scope.url = ($window.URL || $window.webkitURL).createObjectURL(blob);
        } else {
          Log.debug('Failed to Export Identity Broker SP Metadata. Status: ' + status);
        }
      });
    };
  }
})();
