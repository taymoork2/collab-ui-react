namespace Settings {

  class Setting {

    public title:string;
    public template:string;
    public subsectionLabel:string;
    public subsectionDescription:string;
    public isPartner:boolean;
    public isManaged:boolean;
    public isCiscoSupport:boolean;
    public isCiscoHelp:boolean;
    public translate:any;

    constructor(settingKey:string, ctrl:SettingsCtrl) {
      this.title = 'globalSettings.' + settingKey + '.title';

      this.subsectionLabel = 'globalSettings.' + settingKey + '.subsectionLabel';
      this.subsectionDescription = 'globalSettings.' + settingKey + '.subsectionDescription';
      this.template = 'modules/core/settings/setting-' + settingKey + '.tpl.html';

      this.isPartner = ctrl.authinfo.isPartner();
      //this.isManaged = false;
      //this.isCiscoSupport = ctrl.authinfo.isCiscoSupport();
     // this.isCiscoHelp = ctrl.authinfo.isCiscoHelp();
      this.translate = ctrl.translate;
    }
  }

  class AuthSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('authentication', ctrl);
      this.subsectionDescription = '';
    }
/*
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

    $scope.$watch('options.enableSSO', function () {
    var ssoValue = $scope.options.enableSSO;
    if (ssoValue !== 'null') {
      _.set($scope.wizard, 'isNextDisabled', false);
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

    $scope.idpFile = {};
    $scope.$watch('idpFile.file', function (value) {
    if ($scope.idpFile.file) {
      $timeout($scope.importRemoteIdp);
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
          SSOService.deleteMeta(metaUrl, function (status) {
            if (status !== 204) {
              success = false;
            }
            if (success === true) {
              Log.debug('Single Sign-On (SSO) successfully disabled for all users');
              $scope.wizard.nextTab();
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
  };*/

    public enableSSO = 1;

    public configureSSOOptions = [{
      label: this.translate.instant('ssoModal.disableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoNoProvider'
    }, {
      label: this.translate.instant('ssoModal.enableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoProvider'
    }];
  }

  class SupportSetting extends Setting {

    constructor(ctrl:SettingsCtrl) {
      super('support', ctrl);
      this.subsectionLabel = '';
      this.subsectionDescription = '';
    }
  }

  class BrandingSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('branding', ctrl);
      this.subsectionDescription = '';
    }
  }

  class SipDomainSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('sipDomain', ctrl);
    }
  }

  class DomainSetting extends Setting {
    constructor(ctrl:SettingsCtrl) {
      super('domains', ctrl);
      this.subsectionLabel = 'domainManagement.title';
      this.subsectionDescription = 'domainManagement.description';
    }
  }

  class SettingsCtrl {

    private settings:Array<Setting>;

    public translate:any;
    public authinfo:any;

    /* @ngInject */
    constructor(Authinfo, $translate) {

      this.translate = $translate;
      this.authinfo = Authinfo;

      if (Authinfo.isPartner()) {
        this.settings = [
          new BrandingSetting(this),
          new SupportSetting(this)
        ];
      } else {
        this.settings = [
          new BrandingSetting(this),
          new SipDomainSetting(this),
          new DomainSetting(this),
          new AuthSetting(this),
          new SupportSetting(this)
        ];
      }
    }

    public getSettings():Array<Setting> {
      return this.settings;
    }
  }
  angular
    .module('Core')
    .controller('SettingsCtrl', SettingsCtrl);
}
