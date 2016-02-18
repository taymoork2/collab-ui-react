'use strict';

angular.module('WebExApp').service('WebexClientVersion', [
  '$q',
  '$log',
  '$filter',
  '$http',
  'Authinfo',
  'Config',
  'Notification',
  function (
    $q,
    $log,
    $filter,
    $http,
    Authinfo,
    Config,
    Notification
  ) {

    this.relativeUrls = {
      'clientVersions': 'partnertemplate/clientversions', //get
      'setClientVersion': '', //post
      'getClientVersion': '', //get
      'getUseLatestVersion': '', //get
      'setUseLatestVersion': '', //post
      'getTemplate': 'partnertemplate/${partnerId}',
      'postTemplate': 'partnertemplate',
      'putTemplate': 'partnertemplate/${partnerTemplateId}'
    };

    this.getVersionJson = function (partnerTemplate, partnerId, version, useLatest) {
      return {
        'partnerTemplateId': partnerTemplate,
        'partnerId': partnerId,
        'clientVersion': version,
        'useLatest': useLatest
      };
    };

    //reference http://www.codelord.net/2015/09/24/$q-dot-defer-youre-doing-it-wrong/

    this.toggleWebexSelectLatestVersionAlways = function (partnerId, selectLatestVersion) {
      $log.info("Togging");
    };

    this.getToggle_webexSelectLatestVersionAlways = function (partnerId) {
      var selectLatest = "latest_version";
      return $q.when(selectLatest);
    };

    /**
        Sample: data in response

                   {
    "clientVersions": [
      "T30LSP2",
      "T29L",
      "T29LSP10",
      "T29LSP11",
      "T29LSP12",
       "T29LSP13",
      "T29LSP8",
      "T29LSP9",
      "T30L",
        "T30LSP1",
      "T30LSP3"
    ]
   }
       Here we will simply return a list of strings that corresponds to the client versions. 
    */
    this.getWbxClientVersions = function () {
      //http://atlas-integration.wbx2.com/admin/api/v1/partnertemplate/clientversions
      // var url = this.getTotalUrl('clientVersions');
      // return $http.get(url).then(function (response) {
      //   return response.data.clientVersions;
      // });

      var cr = function (response) {
        return response.data.clientVersions;
      };
      return this.getResult('clientVersions', cr);

    }; //getWbxClientVersions

    this.getTotalUrl = function (name, orgId, partnerTemplate) {
      var relativeUrl = this.relativeUrls[name];
      var url = this.getAdminServiceUrl() + relativeUrl;

      if (!angular.isUndefined(orgId)) {
        url = url.replace("${partnerId}", orgId);
      }

      if (!angular.isUndefined(partnerTemplate)) {
        url = url.replace("${partnerTemplateId}", partnerTemplate);
      }

      return url;
    };

    this.getAdminServiceUrl = function () {
      return Config.getAdminServiceUrl();
    };

    this.getTemplate = function (orgId) {
      var cr = function (resp) {
        return resp.data;
      };
      return this.getResult('getTemplate', cr, orgId);
    };

    this.postTemplate = function (orgId, useLatest, selectedVersion) {
      var cr = function (resp) {
        return resp;
      };
      var j = this.getVersionJson("", orgId, selectedVersion, useLatest);
      return this.post('postTemplate', j, orgId);
    };

    this.putTemplate = function (orgId, useLatest, selectedVersion, partnerTemplate) {
      var cr = function (resp) {
        return resp;
      };
      var j = this.getVersionJson(partnerTemplate, orgId, selectedVersion, useLatest);
      return this.post('postTemplate', j, partnerTemplate);
    };

    this.postOrPutTemplate = function (partnerTemplate, orgId, selectedVersion, useLatest) {
      var pu = this.putTemplate;
      var po = this.postTemplate;
      var ge = this.getResult;

      return ge().then(function (resp) {
        if (resp.partnerTemplateId === "") {
          //post
          po(orgId, useLatest, selectedVersion).then(function (resp) {
            return resp;
          }).catch(function (err) {

          });
        } else {
          pu(orgId, useLatest, selectedVersion, partnerTemplate).then(function (resp) {
            return resp;
          }).catch(function (err) {

          });
        }
      }); //end return

    };

    // this.getSelectedWbxClientVersion = function (orgId) {
    //   var prom = this.getResult('getClientVersion', function (response) {
    //     return response; //for now. 
    //   }, orgId);
    //   return prom;
    // };

    // this.getUseLatestVersion = function (orgId) {
    //   var prom = this.getResult('getUseLatestVersion', function (response) {
    //     return response; //for now. 
    //   }, orgId);
    //   return prom;
    // };

    this.getResult = function (name, convertResponse, orgId) {
      var url = this.getTotalUrl(name, orgId);
      var prom = $http.get(url).then(function (response) {
        return convertResponse(response); //here we may need to do data.value
      }).catch(function (error) {
        $q.reject(error); //-1 indicates no result due to http error.
      });
      return prom;
    };

    this.post = function (name, json, partnerTemplate) {
      var url = this.getTotalUrl(name, "", partnerTemplate);
      $http.post(url, json).then(function (response) {
        return response; //we don't care about response. Just success or failure.
      }).catch(function (error) {
        $q.reject(error); //-1 indicates no result due to http error.
      });
    };

    this.put = function (name, json, orgId) {
      var url = this.getTotalUrl(name, orgId);
      $http.put(url, json).then(function (response) {
        return response; //we don't care about response. Just success or failure.
      }).catch(function (error) {
        $q.reject(error); //-1 indicates no result due to http error.
      });
    };

    this.getTestData = function () {
      return "testData";
    };
  }
]);
