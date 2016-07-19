(function () {
  'use strict';

  angular.module('Core')
    .service('SSOService', SSOService);

  /* @ngInject */
  function SSOService($http, Log, Authinfo, UrlConfig) {

    return {
      getMetaInfo: function (callback) {
        var remoteIdpUrl = UrlConfig.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/remote/idp?attributes=id&attributes=entityId';

        $http.get(remoteIdpUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Retrieved meta url');
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },

      importRemoteIdp: function (metadataXmlContent, selfSigned, ssoEnabled, callback) {
        var remoteIdpUrl = UrlConfig.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/remote/idp';
        var payload = {
          schemas: ['urn:cisco:codev:identity:idbroker:metadata:schemas:1.0'],
          metadataXml: metadataXmlContent,
          attributeMapping: ['uid=uid', 'mail=mail'],
          autofedAttribute: 'uid',
          ignoreSignatureVerification: selfSigned,
          ssoEnabled: ssoEnabled
        };

        $http.post(remoteIdpUrl, payload)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Posted metadataXml: ' + metadataXmlContent);
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },

      patchRemoteIdp: function (metaUrl, metadataXmlContent, selfSigned, ssoEnabled, callback) {
        var payload = {
          schemas: ['urn:cisco:codev:identity:idbroker:metadata:schemas:1.0'],
          metadataXml: metadataXmlContent,
          ignoreSignatureVerification: selfSigned,
          ssoEnabled: ssoEnabled
        };

        //for ssoEnabled=false we don't need a metadataXml so remove it if argument is undefined or null
        if (!ssoEnabled && (angular.isUndefined(metadataXmlContent) || metadataXmlContent == null)) {
          delete payload.metadataXml;
        }

        $http({
            method: 'PATCH',
            url: metaUrl,
            data: payload
          })
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Posted metadataXml: ' + metadataXmlContent);
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },

      deleteMeta: function (metaUrl, callback) {
        $http.delete(metaUrl)
          .success(function (data, status) {
            if (status === 204) {
              Log.debug('Successfully deleted resource: ' + metaUrl);
              callback(status);
            }
          })
          .error(function (data, status) {
            callback(status);
          });
      },

      downloadHostedSp: function (callback) {
        var hostedSpUrl = UrlConfig.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/hosted/sp';
        $http.get(hostedSpUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Retrieved metadata file');
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });

      }
    };
  }
})();
