'use strict';

angular.module('WebExApp').service('WebexClientVersion', WebexClientVersion);

/* @ngInject */
function WebexClientVersion(
  $q,
  $log,
  $filter,
  $http,
  Authinfo,
  UrlConfig,
  Notification
) {

  var self = this;

  this.relativeUrls = {
    'clientVersions': 'clientversions', //get
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
      Note, partnerid is different than org id. Must look up
      partnerid using the orgid.
  */
  this.getPartnerIdGivenOrgId = function (orgId) {
    var url = this.getAdminServiceUrl() + "partners/" + orgId;
    var prom = $http.get(url);
    return prom;
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
    return self.getResult('clientVersions', cr);

  }; //getWbxClientVersions

  this.getTotalUrl = function (name, orgId, partnerTemplate) {
    var relativeUrl = self.relativeUrls[name];
    var url = self.getAdminServiceUrl() + relativeUrl;

    if (!angular.isUndefined(orgId)) {
      url = url.replace("${partnerId}", orgId);
    }

    if (!angular.isUndefined(partnerTemplate)) {
      url = url.replace("${partnerTemplateId}", partnerTemplate);
    }

    return url;
  };

  this.getAdminServiceUrl = function () {
    return UrlConfig.getAdminServiceUrl();
  };

  this.getTemplate = function (orgId) {
    var cr = function (resp) {
      return resp;
    };
    return self.getResult('getTemplate', cr, orgId);
  };

  this.postTemplate = function (orgId, useLatest, selectedVersion) {
    var cr = function (resp) {
      return resp;
    };
    var j = self.getVersionJson("", orgId, selectedVersion, useLatest);
    return self.post('postTemplate', j, orgId);
  };

  this.putTemplate = function (orgId, useLatest, selectedVersion, partnerTemplate) {
    var cr = function (resp) {
      return resp;
    };
    var j = self.getVersionJson(partnerTemplate, orgId, selectedVersion, useLatest);
    return self.put('putTemplate', j, partnerTemplate);
  };

  this.postOrPutTemplate = function (orgId, selectedVersion, useLatest) {
    var pu = self.putTemplate;
    var po = self.postTemplate;
    var ge = self.getTemplate;

    return ge(orgId).then(function (resp) {
      var pt = resp.data.partnerTemplateId;
      if (pt === "") {
        //post
        po(orgId, useLatest, selectedVersion).then(function (resp) {
          return resp;
        }).catch(function (err) {

        });
      } else {
        pu(orgId, useLatest, selectedVersion, pt).then(function (resp) {
          return resp;
        }).catch(function (err) {

        });
      }
    }); //end return

  };

  this.getResult = function (name, convertResponse, orgId) {
    var url = self.getTotalUrl(name, orgId);
    var prom = $http.get(url).then(function (response) {
      return convertResponse(response); //here we may need to do data.value
    }).catch(function (error) {
      $q.reject(error);
    });
    return prom;
  };

  this.post = function (name, json, partnerTemplate) {
    var url = self.getTotalUrl(name, "", partnerTemplate);
    return $http.post(url, json).then(function (response) {
      return response;
    }).catch(function (error) {
      $q.reject(error);
    });
  };

  this.put = function (name, json, orgId) {
    var url = self.getTotalUrl(name, orgId, json.partnerTemplateId);
    return $http.put(url, json).then(function (response) {
      return response;
    }).catch(function (error) {
      $q.reject(error);
    });
  };

  this.getTestData = function () {
    return "testData";
  };
}
