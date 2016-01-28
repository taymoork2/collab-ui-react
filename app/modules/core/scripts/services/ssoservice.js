'use strict';

angular.module('Core')
  .service('SSOService', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($rootScope, $http, Storage, Config, Log, Auth, Authinfo) {

      return {
        getMetaInfo: function (callback) {
          var remoteIdpUrl = Config.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/remote/idp?attributes=id&attributes=entityId';

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
          var remoteIdpUrl = Config.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/remote/idp';
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

        patchRemoteIdp: function (metaUrl, metadataXmlContent, ssoEnabled, callback) {
          var payload = {
            schemas: ['urn:cisco:codev:identity:idbroker:metadata:schemas:1.0'],
            metadataXml: metadataXmlContent,
            ssoEnabled: ssoEnabled
          };

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
          var hostedSpUrl = Config.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/hosted/sp';
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
  ]);
