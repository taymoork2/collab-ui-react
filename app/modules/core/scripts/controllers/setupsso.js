'use strict';

angular.module('Core')
  .controller('EnterpriseSettingsCtrl', ['$scope', '$rootScope', '$q', 'SSOService', 'Authinfo', 'AccountOrgService', 'Log', 'Notification', '$translate', '$window', 'Config',
    function ($scope, $rootScope, $q, SSOService, Authinfo, AccountOrgService, Log, Notification, $translate, $window, Config) {

      var strEntityDesc = '<EntityDescriptor ';
      var strEntityId = 'entityID="';
      var strEntityIdEnd = '">';
      var oldSSOValue = 0;

      //SIP URI Domain Controller code
      $scope.cloudSipUriField = 'someText';
      $scope.cloudSipFlag = false;
      $scope.cloudSipErrorFlag = false;

      var orgId = Authinfo.getOrgId();
      AccountOrgService.getOrgSettings(orgId)
        .success(function (data, status) {
          return data;
        });

      $scope.options = {
        configureSSO: 1,
        enableSSO: 0,
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
        if (ssoValue !== oldSSOValue) {
          if (ssoValue === 0) {
            deleteSSO();
          } else if (ssoValue === 1) {
            reEnableSSO();
          }
        }
        oldSSOValue = ssoValue;
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
              var start = $rootScope.fileContents.indexOf(strEntityDesc);
              start = $rootScope.fileContents.indexOf(strEntityId, start) + 10;
              var end = $rootScope.fileContents.indexOf(strEntityIdEnd, start);
              var newEntityId = $rootScope.fileContents.substring(start, end);
              if (newEntityId.substring(0, 4) === 'http') {
                for (var datum in data.data) {
                  if (data.data[datum].entityId === newEntityId) {
                    metaUrl = data.data[datum].url;
                  }
                }

                if (metaUrl !== null) {
                  patchRemoteIdp(metaUrl);
                } else {
                  postRemoteIdp();
                }
              } else {
                Log.debug('Did not find entityId in IdP metadata file');
                Notification.notify([$translate.instant('ssoModal.invalidFile')], 'error');
              }
            } else {
              postRemoteIdp();
            }
          } else {
            Log.debug('Failed to retrieve meta url. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.importFailed', {
              status: status
            })], 'error');
          }
        });
      };

      function deleteSSO() {
        var metaUrls = [];
        var metaUrl = null;
        var success = true;
        SSOService.getMetaInfo(function (data, status) {
          if (data.success && data.data.length > 0) {
            for (var datum in data.data) {
              metaUrls.push(data.data[datum].url);
            }
            for (var num in metaUrls) {
              metaUrl = metaUrls[num];
              SSOService.deleteMeta(metaUrl, function (status) {
                if (status !== 204) {
                  success = false;
                }
              });
            }
            if (success === true) {
              Log.debug('Single Sign-On (SSO) successfully disabled for all users');
              Notification.notify([$translate.instant('ssoModal.disableSuccess', {
                status: status
              })], 'success');
            } else {
              Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
              Notification.notify([$translate.instant('ssoModal.disableFailed', {
                status: status
              })], 'error');
            }
          } else {
            Log.debug('Failed to retrieve meta url. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.disableFailed', {
              status: status
            })], 'error');
          }
        });
      }

      function reEnableSSO() {
        var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
        SSOService.importRemoteIdp($rootScope.fileContents, selfSigned, function (data, status) {
          if (data.success) {
            Log.debug('Single Sign-On (SSO) successfully enabled for all users');
            Notification.notify([$translate.instant('ssoModal.enableSSOSuccess', {
              status: status
            })], 'success');
          } else {
            Log.debug('Failed to enable Single Sign-On (SSO). Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.enableSSOFailure', {
              status: status
            })], 'error');
          }
        });
      }

      function postRemoteIdp() {
        var selfSigned = ($scope.options.SSOSelfSigned ? true : false);
        SSOService.importRemoteIdp($rootScope.fileContents, selfSigned, function (data, status) {
          if (data.success) {
            Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.importSuccess', {
              status: status
            })], 'success');
          } else {
            Log.debug('Failed to Import On-premise IdP Metadata. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.importFailed', {
              status: status
            })], 'error');
          }
        });
      }

      function patchRemoteIdp(metaUrl) {
        SSOService.patchRemoteIdp(metaUrl, $rootScope.fileContents, function (data, status) {
          if (data.success) {
            Log.debug('Imported On-premise IdP Metadata. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.importSuccess', {
              status: status
            })], 'success');
          } else {
            Log.debug('Failed to Patch On-premise IdP Metadata. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.importFailed', {
              status: status
            })], 'error');
          }
        });
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
              Notification.notify([$translate.instant('ssoModal.retrieveEntityIdFailed', {
                status: status
              })], 'error');
            }
          } else {
            Log.debug('Failed to retrieve entity id. Status: ' + status);
            Notification.notify([$translate.instant('ssoModal.retrieveEntityIdFailed', {
              status: status
            })], 'error');
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
