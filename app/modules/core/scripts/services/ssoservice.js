'use strict';

angular.module('Core')
  .service('SSOService', ['$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($http, Storage, Config, Log, Auth, Authinfo) {

      var token = Storage.get('accessToken');

      return {
        getMetaInfo: function (callback) {
          var remoteIdpUrl = Config.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/remote/idp?attributes=id&attributes=entityId';

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(remoteIdpUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved meta url');
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        importRemoteIdp: function (metadataXmlContent, callback) {
          var remoteIdpUrl = Config.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/remote/idp';
          var payload = {
            schemas: ['urn:cisco:codev:identity:idbroker:metadata:schemas:1.0'],
            metadataXml: metadataXmlContent,
            attributeMapping: ['uid=uid', 'mail=mail'],
            autofedAttribute: 'uid'
          };

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.post(remoteIdpUrl, payload)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Posted metadataXml: ' + metadataXmlContent);
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        patchRemoteIdp: function (metaUrl, metadataXmlContent, callback) {
          var payload = {
            schemas: ['urn:cisco:codev:identity:idbroker:metadata:schemas:1.0'],
            metadataXml: metadataXmlContent
          };

          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http({
              method: 'PATCH',
              url: metaUrl,
              data: payload
            })
            .success(function (data, status) {
              data.success = true;
              Log.debug('Posted metadataXml: ' + metadataXmlContent);
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        deleteMeta: function (metaUrl, callback) {
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.delete(metaUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Successfully deleted resource: ' + metaUrl);
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        downloadHostedSp: function (callback) {
          var hostedSpUrl = Config.getSSOSetupUrl() + Authinfo.getOrgId() + '/v1/samlmetadata/hosted/sp';
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(hostedSpUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved metadata file');
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        }
      };
    }
  ]);
