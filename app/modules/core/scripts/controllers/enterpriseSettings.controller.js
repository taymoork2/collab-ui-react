'use strict';

angular.module('Core')
  .controller('EnterpriseSettingsCtrl', ['$scope', '$rootScope', '$q', 'SSOService', 'Orgservice', 'SparkDomainManagementService', 'Authinfo', 'Log', '$log', 'Notification', '$translate', '$window', 'Config',
    function ($scope, $rootScope, $q, SSOService, Orgservice, SparkDomainManagementService, Authinfo, Log, $log, Notification, $translate, $window, Config) {

      var strEntityDesc = '<EntityDescriptor ';
      var strEntityId = 'entityID="';
      var strEntityIdEnd = '"';
      var oldSSOValue = 0;

      //SIP URI Domain Controller code
      $scope.cloudSipUriField = {};
      $scope.cloudSipUriField.inputValue = '';
      $scope.cloudSipUriField.isDisabled = false;
      $scope.cloudSipUriField.isAvailable = false;
      $scope.cloudSipUriField.errorMsg = $translate.instant('firstTimeWizard.setSipUriErrorMessage');

      $scope.setRecommendedSipUri = function() {
        Orgservice.getOrg(function (data, status) {
          if (status === 200) {
            if (data.sipCloudDomain) {
              $scope.cloudSipUriField.inputValue = data.sipCloudDomain;
              $scope.cloudSipUriField.isDisabled = true;
            } else if (data.verifiedDomains) {
              $scope.cloudSipUriField.inputValue = data.verifiedDomains[0];
            } else if (data.displayName) {
              if (data.displayName.indexOf('_') > 0) {
                var displayName = data.displayName.split('_')[0].toLowerCase();
                $scope.cloudSipUriField.inputValue = displayName;
              } else if (data.displayName.indexOf(' ') > 0) {
                var displayName = data.displayName.split(' ')[0].toLowerCase();
                $scope.cloudSipUriField.inputValue = displayName;
              }
            } else {
              $scope.cloudSipUriField.inputValue = '';
            }
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
          }
        });
      };
      $scope.setRecommendedSipUri();

      $scope.checkSipUriAvailability = function() {
        //$log.log($event);
        if ($scope.cloudSipUriField.inputValue !== '') {
          var domain = $scope.cloudSipUriField.inputValue + Config.getSparkDomainCheckUrl();
          var payload = {'name': domain, 'isVerifyDomainOnly': true};
          SparkDomainManagementService.checkDomainAvailability(payload, function(data, status) {
            if (status === 200 && data.isDomainAvailable) {
              $scope.cloudSipUriField.isAvailable = true;
              $scope.cloudSipUriField.isError = false;
            } else {
              $scope.cloudSipUriField.isError = true;
            }
          });
        }
      };

      $scope.validateSipUri = function () {
        if ($scope.cloudSipUriField.inputValue.length > 40) {
          $scope.cloudSipUriField.isError = true;
        }

        return $scope.cloudSipUriField.isError;
      };

      $scope.options = {
        configureSSO: 1,
        enableSSO: null,
        SSOSelfSigned: 0
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
        label: $translate.instant('ssoModal.finalDisableSSO'),
        value: 0,
        name: 'finalssoOptions',
        id: 'finalSsoNoProvider'
      }, {
        label: $translate.instant('ssoModal.finalEnableSSO'),
        value: 1,
        name: 'finalssoOptions',
        id: 'finalSsoProvider'
      }];

      $scope.$watch('options.enableSSO', function () {
        var ssoValue = $scope.options.enableSSO;
        if (ssoValue !== 'null') {
          $scope.wizard.isNextDisabled = false;
        }
      });

      $scope.$on('wizard-set-sso-event', function () {
        var ssoValue = $scope.options.enableSSO;
        if (ssoValue === 0) {
          deleteSSO();
        } else if (ssoValue === 1) {
          reEnableSSO();
        }
      });

      $scope.initNext = function () {
        var deferred = $q.defer();
        if ($scope.options.configureSSO === 1 && angular.isDefined($scope.wizard) && angular.isFunction($scope.wizard.nextTab)) {
          deferred.reject();
          $scope.wizard.nextTab();
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      };

      $scope.setFile = function (element) {
        $scope.$apply(function ($scope) {
          $scope.file = element.files[0];
          $scope.filename = element.files[0].name;
        });

        if ($scope.file) {
          var r = new FileReader();
          r.onload = (function () {
            return function (e) {
              $rootScope.fileContents = e.target.result;
            };
          })($scope.file);
          r.readAsText($scope.file);
        } else {
          Log.debug('Failed to read metadata file');
          Notification.notify([$translate.instant('ssoModal.readFileFailed')], 'error');
        }
      };

      $scope.importRemoteIdp = function () {
        var metaUrl = null;
        SSOService.getMetaInfo(function (data, status) {
          if (data.success) {
            if (data.data.length > 0) {
              //check if data already exists for this entityId
              var newEntityId = checkNewEntityId(data);
              if (newEntityId.startsWith('http')) {
                for (var datum in data.data) {
                  if (data.data[datum].entityId === newEntityId) {
                    metaUrl = data.data[datum].url;
                    break;
                  } else {
                    SSOService.deleteMeta(data.data[datum].url);
                    break;
                  }
                }

                if (metaUrl !== null) {
                  patchRemoteIdp(metaUrl);
                } else {
                  postRemoteIdp();
                }
              } else {
                Log.debug('Did not find entityId in IdP metadata file');
                Notification.error('ssoModal.invalidFile', {
                  status: status
                });
              }
            } else {
              postRemoteIdp();
            }
          } else {
            Log.debug('Failed to retrieve meta url. Status: ' + status);
            Notification.error('ssoModal.importFailed', {
              status: status
            });
          }
        });
      };

      function deleteSSO() {
        var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
        var metaUrl = null;
        var success = true;
        SSOService.getMetaInfo(function (data, status) {
          if (data.success && data.data.length > 0) {
            //check if data already exists for this entityId
            metaUrl = _.get(data, 'data[0].url');
            if (metaUrl !== null) {
              SSOService.deleteMeta(metaUrl, function (status) {
                if (status !== 204) {
                  success = false;
                }
                if (success === true) {
                  Log.debug('Single Sign-On (SSO) successfully disabled for all users');
                  Notification.success('ssoModal.disableSuccess', {
                    status: status
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
        });
      }

      function reEnableSSO() {
        var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
        var metaUrl = null;
        SSOService.getMetaInfo(function (data, status) {
          if (data.success && data.data.length > 0) {
            //check if data already exists for this entityId
            var newEntityId = checkNewEntityId(data);
            if (newEntityId.startsWith('http')) {
              for (var datum in data.data) {
                if (data.data[datum].entityId === newEntityId) {
                  metaUrl = data.data[datum].url;
                  break;
                }
              }

              if (metaUrl !== null) {
                SSOService.patchRemoteIdp(metaUrl, $rootScope.fileContents, true, function (data, status) {
                  if (data.success) {
                    Log.debug('Single Sign-On (SSO) successfully enabled for all users');
                    Notification.success('ssoModal.enableSSOSuccess', {
                      status: status
                    });
                  } else {
                    Log.debug('Failed to enable Single Sign-On (SSO). Status: ' + status);
                    Notification.error('ssoModal.enableSSOFailure', {
                      status: status
                    });
                  }
                });
              }
            }
          } else {
            SSOService.importRemoteIdp($rootScope.fileContents, selfSigned, true, function (data, status) {
              if (data.success) {
                Log.debug('Single Sign-On (SSO) successfully enabled for all users');
                Notification.success('ssoModal.enableSSOSuccess', {
                  status: status
                });
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
        SSOService.importRemoteIdp($rootScope.fileContents, selfSigned, false, function (data, status) {
          if (data.success) {
            Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
            Notification.success('ssoModal.importSuccess', {
              status: status
            });
          } else {
            Log.debug('Failed to Import On-premise IdP Metadata. Status: ' + status);
            Notification.error('ssoModal.importFailed', {
              status: status
            });
          }
        });
      }

      function patchRemoteIdp(metaUrl) {
        SSOService.patchRemoteIdp(metaUrl, $rootScope.fileContents, false, function (data, status) {
          if (data.success) {
            Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
            Notification.success('ssoModal.importSuccess', {
              status: status
            });
          } else {
            Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
            Notification.error('ssoModal.importFailed', {
              status: status
            });
          }
        });
      }

      function checkNewEntityId(data) {
        var start = $rootScope.fileContents.indexOf(strEntityDesc);
        start = $rootScope.fileContents.indexOf(strEntityId, start) + strEntityId.length;
        var end = $rootScope.fileContents.indexOf(strEntityIdEnd, start);
        var newEntityId = $rootScope.fileContents.substring(start, end);
        return newEntityId;
      }

      $scope.openTest = function () {
        var entityId = null;
        SSOService.getMetaInfo(function (data, status) {
          if (data.success) {
            if (data.data.length > 0) {
              entityId = data.data[0].entityId;
            }
            if (entityId !== null) {
              var testUrl = Config.getSSOTestUrl() + '?metaAlias=/' + Authinfo.getOrgId() + '/sp&idpEntityID=' + encodeURIComponent(entityId) + '&binding=urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST&requestBinding=urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';
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
  ]);
