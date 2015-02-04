'use strict';

angular.module('Core')
  .controller('setupSSODialogCtrl', ['$scope', '$q', 'SSOService', 'Authinfo', 'Log', 'Notification', '$translate', '$window', 'Config',
    function ($scope, $q, SSOService, Authinfo, Log, Notification, $translate, $window, Config) {

      var strEntityDesc = '<EntityDescriptor ';
      var strEntityId = 'entityID="';
      var strEntityIdEnd = '">';

      $scope.options = {
        configureSSO: 1
      };
      $scope.configureSSOOptions = [{
        label: $translate.instant('ssoModal.enableSSO'),
        value: 1,
        name: 'ssoOptions',
        id: 'ssoProvider'
      }, {
        label: $translate.instant('ssoModal.disableSSO'),
        value: 0,
        name: 'ssoOptions',
        id: 'ssoNoProvider'
      }];

      $scope.enableSSONext = function () {
        //need to set enableSSO flag in CI
      };

      $scope.initNext = function () {
        var deferred = $q.defer();
        if ($scope.options.configureSSO == 0 && angular.isDefined($scope.wizard) && angular.isFunction($scope.wizard.nextTab)) {
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
              $scope.fileContents = e.target.result;
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
              var start = $scope.fileContents.indexOf(strEntityDesc);
              start = $scope.fileContents.indexOf(strEntityId, start) + 10;
              var end = $scope.fileContents.indexOf(strEntityIdEnd, start);
              var newEntityId = $scope.fileContents.substring(start, end);
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

      var postRemoteIdp = function () {
        SSOService.importRemoteIdp($scope.fileContents, function (data, status) {
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
      };

      var patchRemoteIdp = function (metaUrl) {
        SSOService.patchRemoteIdp(metaUrl, $scope.fileContents, function (data, status) {
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
      };

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
            // Notification.notify([$translate.instant('ssoModal.downloadMetaFailed', {
            //   status: status
            // })], 'error');
          }
        });
      };

    }
  ])
  .config([
    '$compileProvider',
    function ($compileProvider) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
    }
  ]);
