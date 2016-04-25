(function () {
  'use strict';

  angular.module('WebExApp').factory('WebExUtilsFact', WebExUtilsFact);

  /* @ngInject */
  function WebExUtilsFact(
    $q,
    $log,
    $rootScope,
    $http,
    $timeout,
    Authinfo,
    Orgservice,
    WebExXmlApiFact,
    webExXmlApiInfoObj
  ) {
    var obj = {};

    obj.getSiteName = function (siteUrl) {
      var funcName = "getSiteName()";
      var logMsg = "";

      var freeSiteSuffixList = [
        ".my",
        ".mydmz",
        ".mybts",
        ".mydev"
      ];

      var dotIndex = siteUrl.indexOf(".");
      var siteName = siteUrl.slice(0, dotIndex);
      var restOfSiteUrl = siteUrl.slice(dotIndex);

      freeSiteSuffixList.forEach(
        function checkFreeSiteSuffix(freeSiteSuffix) {
          var tempSuffix = freeSiteSuffix + ".";

          if (restOfSiteUrl.indexOf(tempSuffix) == 0) {
            siteName = siteName + freeSiteSuffix;
          }
        } // checkFreeSiteSuffix()
      );

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl + "\n" +
        "dotIndex=" + dotIndex + "\n" +
        "restOfSiteUrl=" + restOfSiteUrl + "\n" +
        "siteName=" + siteName;
      // $log.log(logMsg);

      return siteName;
    }; // getSiteName()

    obj.getNewInfoCardObj = function (
      siteUrl,
      iconClass1,
      iconClass2
    ) {

      var infoCardObj = {
        id: "SiteInfo",
        label: siteUrl,
        isLicensesOverage: false,

        licensesTotal: {
          id: "licensesTotal",
          count: "---"
        },

        licensesUsage: {
          id: "licensesUsage",
          count: "---"
        },

        licensesAvailable: {
          id: "licensesAvailable",
          count: "---"
        },

        iframeLinkObj1: {
          iconClass: iconClass1,
          iframePageObj: null,
        },

        iframeLinkObj2: {
          iconClass: iconClass2,
          iframePageObj: null,
        },
      };

      return infoCardObj;

    }; // getNewInfoObj()

    obj.validateXmlData = function (
      commentText,
      infoXml,
      startOfBodyStr,
      endOfBodyStr
    ) {
      var funcName = "validateXmlData()";
      var logMsg = "";

      logMsg = funcName + ": " + "\n" +
        "commentText=" + commentText + "\n" +
        "infoXml=\n" + infoXml + "\n" +
        "startOfBodyStr=" + startOfBodyStr + "\n" +
        "endOfBodyStr=" + endOfBodyStr;
      // $log.log(logMsg);

      var headerJson = WebExXmlApiFact.xml2JsonConvert(
        commentText + " Header",
        infoXml,
        "<serv:header>",
        "<serv:body>"
      ).body;

      var bodyJson = {};
      if ((null != startOfBodyStr) && (null != endOfBodyStr)) {
        bodyJson = WebExXmlApiFact.xml2JsonConvert(
          commentText,
          infoXml,
          startOfBodyStr,
          endOfBodyStr
        ).body;
      }

      var errReason = "";
      var errId = "";
      if ("SUCCESS" != headerJson.serv_header.serv_response.serv_result) {
        errReason = headerJson.serv_header.serv_response.serv_reason;
        errId = headerJson.serv_header.serv_response.serv_exceptionID;

        logMsg = funcName + ": " + "ERROR!!!" + "\n" +
          "headerJson=\n" + JSON.stringify(headerJson) + "\n" +
          "errReason=\n" + errReason;
        $log.log(logMsg);
      }

      var result = {
        headerJson: headerJson,
        bodyJson: bodyJson,
        errId: errId,
        errReason: errReason
      };

      return result;
    }; // validateXmlData()

    obj.validateSiteVersionXmlData = function (siteVersionXml) {
      var siteVersion = this.validateXmlData(
        "Site Version",
        siteVersionXml,
        "<ep:",
        "</serv:bodyContent>"
      );

      return siteVersion;
    }; // validateSiteVersionXmlData()

    obj.validate = function (enableT30UnifiedAdminInfoXml) {

    }; //

    obj.validateUserInfoXmlData = function (userInfoXml) {
      var userInfo = this.validateXmlData(
        "User Data",
        userInfoXml,
        "<use:",
        "</serv:bodyContent>"
      );

      return userInfo;
    }; // validateUserInfoXmlData()

    obj.validateSiteInfoXmlData = function (siteInfoXml) {
      var siteInfo = this.validateXmlData(
        "Site Info",
        siteInfoXml,
        "<ns1:",
        "</serv:bodyContent>"
      );

      return siteInfo;
    }; // validateSiteInfoXmlData()

    obj.validateMeetingTypesInfoXmlData = function (meetingTypesInfoXml) {
      var meetingTypesInfo = this.validateXmlData(
        "Meeting Types Info",
        meetingTypesInfoXml,
        "<mtgtype:",
        "</serv:bodyContent>"
      );

      return meetingTypesInfo;
    }; // validateMeetingTypesInfoXmlData()

    obj.validateAdminPagesInfoXmlData = function (adminPagesInfoXml) {
      var adminPagesInfo = this.validateXmlData(
        "Admin Pages Info",
        adminPagesInfoXml,
        "<ns1:",
        "</serv:bodyContent>"
      );

      return adminPagesInfo;
    }; // validateAdminPagesInfoXmlData()

    obj.getSiteVersion = function (siteVersionJsonObj) {
      var funcName = "getSiteVersion()";
      var logMsg = "";

      var trainReleaseJson = {
        trainReleaseVersion: null,
        trainReleaseOrder: null
      };

      var trainReleaseVersion = null;
      var trainReleaseOrder = null;

      if ("" === siteVersionJsonObj.errId) { // got a good response
        var siteVersionJson = siteVersionJsonObj.bodyJson;

        trainReleaseJson.trainReleaseVersion = siteVersionJson.ep_trainReleaseVersion;
        trainReleaseJson.trainReleaseOrder = siteVersionJson.ep_trainReleaseOrder;
      }

      return trainReleaseJson;
    }; // getSiteVersion()

    obj.getEnableT30UnifiedAdmin = function (enableT30UnifiedAdminJsonObj) {
      var funcName = "getEnableT30UnifiedAdmin()";
      var logMsg = "";

      var enableT30UnifiedAdmin = null;

      if ("" === enableT30UnifiedAdminJsonObj.errId) { // got a good response
        enableT30UnifiedAdmin = enableT30UnifiedAdminJsonObj.bodyJson.ns1_enableT30UnifiedAdmin;
      }

      return enableT30UnifiedAdmin;
    }; // getEnableT30UnifiedAdmin()

    obj.getAllSitesWebexLicenseInfo = function () {
      var deferredGetWebexLicenseInfo = $q.defer();

      Orgservice.getValidLicenses().then(
        function getValidLicensesSuccess(licenses) {
          var funcName = "getValidLicensesSuccess()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "licenses=" + JSON.stringify(licenses);
          // $log.log(logMsg);

          var allSitesLicenseInfo = [];

          licenses.forEach(
            function checkLicense(license) {
              logMsg = funcName + ": " + "\n" +
                "license=" + JSON.stringify(license);
              // $log.log(logMsg);

              if (
                ("CONFERENCING" == license.licenseType) || ("CMR" == license.licenseType)) {

                var licenseFields = license.licenseId.split("_");
                var siteUrl = licenseFields[licenseFields.length - 1];
                var serviceType = licenseFields[0];
                var capacity = license.capacity;

                var licenseInfo = null;

                var siteHasMCLicense = false;
                var siteHasECLicense = false;
                var siteHasSCLicense = false;
                var siteHasTCLicense = false;
                var siteHasCMRLicense = false;
                var siteHasEELicense = false;

                if ("MC" == serviceType) {
                  licenseInfo = {
                    webexSite: siteUrl,
                    siteHasMCLicense: true,
                    offerCode: serviceType,
                    capacity: capacity
                  };
                } else if ("EC" == serviceType) {
                  licenseInfo = {
                    webexSite: siteUrl,
                    siteHasECLicense: true,
                    offerCode: serviceType,
                    capacity: capacity
                  };
                } else if ("SC" == serviceType) {
                  licenseInfo = {
                    webexSite: siteUrl,
                    siteHasSCLicense: true,
                    offerCode: serviceType,
                    capacity: capacity
                  };
                } else if ("TC" == serviceType) {
                  licenseInfo = {
                    webexSite: siteUrl,
                    siteHasTCLicense: true,
                    offerCode: serviceType,
                    capacity: capacity
                  };
                } else if ("CMR" == serviceType) {
                  licenseInfo = {
                    webexSite: siteUrl,
                    siteHasCMRLicense: true,
                    offerCode: serviceType,
                    capacity: capacity
                  };
                } else if ("EE" == serviceType) {
                  licenseInfo = {
                    webexSite: siteUrl,
                    siteHasEELicense: true,
                    offerCode: serviceType,
                    capacity: capacity
                  };
                }

                allSitesLicenseInfo.push(licenseInfo);
              }
            } // checkLicense()
          ); // licenses.forEach()

          if (0 < allSitesLicenseInfo.length) {
            deferredGetWebexLicenseInfo.resolve(allSitesLicenseInfo);
          } else {
            deferredGetWebexLicenseInfo.reject(allSitesLicenseInfo);
          }
        }, // getValidLicensesSuccess()

        function getValidLicensesError(info) {
          var funcName = "getValidLicensesError()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "info=" + JSON.stringify(info);
          $log.log(logMsg);

          deferredGetWebexLicenseInfo.reject(info);
        } // getValidLicensesError()
      ); // Orgservice.getValidLicenses().then()

      return deferredGetWebexLicenseInfo.promise;
    }; // getAllSitesWebexLicenseInfo()

    obj.setInfoCardLicenseInfo = function (
      licenseInfo,
      infoCardObj
    ) {

      infoCardObj.licensesTotal.count = licenseInfo.volume;
      infoCardObj.licensesUsage.count = licenseInfo.usage;
      infoCardObj.licensesAvailable.count = licenseInfo.available;

      if (0 <= licenseInfo.available) {
        infoCardObj.licensesAvailable.count = licenseInfo.available;
      } else {
        infoCardObj.isLicensesOverage = true;
        infoCardObj.licensesAvailable.count = licenseInfo.available * -1;
      }
    }; // setInfoCardLicenseInfo();

    obj.logoutSite = function () {
      var siteUrl = $rootScope.lastSite;

      var promise;
      if (!angular.isDefined(siteUrl)) {
        $log.log('No WebEx site visited.');
        var deferred = $q.defer();
        deferred.resolve('OK');
        promise = deferred.promise;
      } else {
        var siteName = obj.getSiteName(siteUrl);

        var logoutUrl = "https://" + $rootScope.nginxHost + "/wbxadmin/clearcookie.do?proxyfrom=atlas&siteurl=" + siteName;
        $log.log('Logout from WebEx site ' + siteName + ", " + logoutUrl);

        var jqpromise = $.ajax({
          type: 'POST',
          url: logoutUrl,
          data: $.param({
            ngxsiteurl: siteUrl
          }),
          xhrFields: {
            withCredentials: true
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 250
        });
        promise = $q.when(jqpromise); //convert into angularjs promise
      }
      return promise;
    };

    return obj;
  } // webexUtilsFact()
})();
