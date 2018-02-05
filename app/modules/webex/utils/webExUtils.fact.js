(function () {
  'use strict';

  /* @ngInject */
  function WebExUtilsFact(
    $log,
    $q,
    $rootScope,
    Auth,
    Authinfo,
    WebExXmlApiFact
  ) {
    var obj = {};

    obj.getSiteAdminUrl = function (siteUrl) {
      var funcName = 'getSiteAdminUrl()';
      var logMsg = '';

      var siteAdminProtocol = 'https://';
      var siteAdminLink = '/wbxadmin/default.do?siteurl=';

      var siteAdminUrl = siteAdminProtocol + siteUrl + siteAdminLink + obj.getSiteName(siteUrl).toLowerCase();

      logMsg = funcName + '\n' +
        'siteUrl=' + siteUrl + '\n' +
        'siteAdminURl=' + JSON.stringify(siteAdminUrl);
      $log.log(logMsg);

      return siteAdminUrl;
    };

    obj.isCIEnabledSite = function (siteUrl) {
      // var funcName = "isCIEnabledSite()";
      // var logMsg = "";

      var licenses = Authinfo.getLicenses();

      var confLicenses = _.filter(licenses, {
        licenseType: 'CONFERENCING',
        siteUrl: siteUrl,
      });

      var cmrLicenses = _.filter(licenses, {
        licenseType: 'CMR',
        siteUrl: siteUrl,
      });

      var confLicensesNotCI = _.filter(licenses, {
        siteUrl: siteUrl,
        licenseType: 'CONFERENCING',
        isCIUnifiedSite: false,
      });

      var cmrLicensesNotCI = _.filter(licenses, {
        licenseType: 'CMR',
        siteUrl: siteUrl,
        isCIUnifiedSite: false,
      });

      var webexLicensesLen = confLicenses.length + cmrLicenses.length;
      var webexLicensesNotCILen = confLicensesNotCI.length + cmrLicensesNotCI.length;

      if (
        (0 < webexLicensesNotCILen) &&
        (webexLicensesNotCILen == webexLicensesLen)
      ) {
        return false;
      }

      return true;
    }; // isCIEnabledSite()

    obj.getSiteNameAndType = function (siteUrl) {
      var funcName = 'getSiteNameAndType()';
      var logMsg = '';

      var siteUrlParts = siteUrl.split('.');
      var siteUrlPartsCount = siteUrlParts.length;
      var isMCOnlineSite = false;
      var siteName = siteUrlParts[0];

      if (4 <= siteUrlPartsCount) {
        var siteNameSuffix = siteUrlParts[1];
        var validMCOnlineSuffixs = [
          'my',
          'mybts',
          'mydev',
          'mydmz',
        ];

        validMCOnlineSuffixs.forEach(
          function (validMCOnlineSuffix) {
            if (
              (!isMCOnlineSite) &&
              (validMCOnlineSuffix == siteNameSuffix)
            ) {
              siteName = siteName + '.' + siteNameSuffix;
              isMCOnlineSite = true;
            }
          }
        );
      }

      if (isMCOnlineSite) {
        logMsg = funcName + '\n' +
          'siteUrl=' + siteUrl + '\n' +
          'siteUrlParts=' + siteUrlParts + '\n' +
          'siteUrlPartsCount=' + siteUrlPartsCount + '\n' +
          'siteName=' + siteName + '\n' +
          'isMCOnlineSite=' + isMCOnlineSite;
        $log.log(logMsg);
      }

      var resultObj = {
        siteName: siteName,
        isMCOnlineSite: isMCOnlineSite,
      };

      return resultObj;
    }; // getSiteNameAndType()

    obj.getSiteName = function (siteUrl) {
      // var funcName = "getSiteName()";
      // var logMsg = "";

      var siteNameAndTypeObj = obj.getSiteNameAndType(siteUrl);
      var siteName = siteNameAndTypeObj.siteName;

      return (siteName);
    }; // getSiteName()

    obj.getNewInfoCardObj = function (
      siteUrl,
      iconClass1,
      iconClass2
    ) {
      var infoCardObj = {
        id: 'SiteInfo',
        label: siteUrl,
        isLicensesOverage: false,

        licensesTotal: {
          id: 'licensesTotal',
          count: '---',
        },

        licensesUsage: {
          id: 'licensesUsage',
          count: '---',
        },

        licensesAvailable: {
          id: 'licensesAvailable',
          count: '---',
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
      var funcName = 'validateXmlData()';
      var logMsg = '';

      logMsg = funcName + ': ' + '\n' +
        'commentText=' + commentText + '\n' +
        'infoXml=\n' + infoXml + '\n' +
        'startOfBodyStr=' + startOfBodyStr + '\n' +
        'endOfBodyStr=' + endOfBodyStr;
      // $log.log(logMsg);

      var headerJson = WebExXmlApiFact.xml2JsonConvert(
        commentText + ' Header',
        infoXml,
        '<serv:header>',
        '<serv:body>'
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

      var errReason = '';
      var errId = '';
      if ('SUCCESS' != headerJson.serv_header.serv_response.serv_result) {
        errReason = headerJson.serv_header.serv_response.serv_reason;
        errId = headerJson.serv_header.serv_response.serv_exceptionID;

        logMsg = funcName + ': ' + 'ERROR!!!' + '\n' +
          'headerJson=\n' + JSON.stringify(headerJson) + '\n' +
          'errReason=\n' + errReason;
        $log.log(logMsg);
      }

      var result = {
        headerJson: headerJson,
        bodyJson: bodyJson,
        errId: errId,
        errReason: errReason,
      };

      return result;
    }; // validateXmlData()

    obj.validateSiteVersionXmlData = function (siteVersionXml) {
      var siteVersion = this.validateXmlData(
        'Site Version',
        siteVersionXml,
        '<ep:',
        '</serv:bodyContent>'
      );

      return siteVersion;
    }; // validateSiteVersionXmlData()

    obj.validate = function () {}; //

    obj.validateUserInfoXmlData = function (userInfoXml) {
      var userInfo = this.validateXmlData(
        'User Data',
        userInfoXml,
        '<use:',
        '</serv:bodyContent>'
      );

      return userInfo;
    }; // validateUserInfoXmlData()

    obj.validateSiteInfoXmlData = function (siteInfoXml) {
      var siteInfo = this.validateXmlData(
        'Site Info',
        siteInfoXml,
        '<ns1:',
        '</serv:bodyContent>'
      );

      return siteInfo;
    }; // validateSiteInfoXmlData()

    obj.validateMeetingTypesInfoXmlData = function (meetingTypesInfoXml) {
      var meetingTypesInfo = this.validateXmlData(
        'Meeting Types Info',
        meetingTypesInfoXml,
        '<mtgtype:',
        '</serv:bodyContent>'
      );

      return meetingTypesInfo;
    }; // validateMeetingTypesInfoXmlData()

    obj.validateAdminPagesInfoXmlData = function (adminPagesInfoXml) {
      var adminPagesInfo = this.validateXmlData(
        'Admin Pages Info',
        adminPagesInfoXml,
        '<ns1:',
        '</serv:bodyContent>'
      );

      return adminPagesInfo;
    }; // validateAdminPagesInfoXmlData()

    obj.getSiteVersion = function (siteVersionJsonObj) {
      // var funcName = "getSiteVersion()";
      // var logMsg = "";

      var trainReleaseJson = {
        trainReleaseVersion: null,
        trainReleaseOrder: null,
      };

      // var trainReleaseVersion = null;
      // var trainReleaseOrder = null;

      if ('' === siteVersionJsonObj.errId) { // got a good response
        var siteVersionJson = siteVersionJsonObj.bodyJson;

        trainReleaseJson.trainReleaseVersion = siteVersionJson.ep_trainReleaseVersion;
        trainReleaseJson.trainReleaseOrder = siteVersionJson.ep_trainReleaseOrder;
      }

      return trainReleaseJson;
    }; // getSiteVersion()

    obj.getEnableT30UnifiedAdmin = function (enableT30UnifiedAdminJsonObj) {
      // var funcName = "getEnableT30UnifiedAdmin()";
      // var logMsg = "";

      var enableT30UnifiedAdmin = null;

      if ('' === enableT30UnifiedAdminJsonObj.errId) { // got a good response
        enableT30UnifiedAdmin = enableT30UnifiedAdminJsonObj.bodyJson.ns1_enableT30UnifiedAdmin;
      }

      return enableT30UnifiedAdmin;
    }; // getEnableT30UnifiedAdmin()

    obj.getOrgWebexLicenses = function (orgInfo) {
      var funcName = 'getOrgWebexLicenses()';
      var logMsg = '';

      var orgWebexLicenses = [];

      if (null != orgInfo) {
        var customerOrderIDs = orgInfo.data.customers;

        if (1 < customerOrderIDs.size) {
          logMsg = funcName + '\n' +
            'customerOrderIDs.size=' + customerOrderIDs.size;
          $log.log(logMsg);
        }

        customerOrderIDs.forEach(
          function customer(customerOrderID) {
            var custLicenses = customerOrderID.licenses;
            var custSubscriptions = customerOrderID.subscriptions;

            if (null != custLicenses) {
              orgWebexLicenses = orgWebexLicenses.concat(custLicenses);
            } else if (null != custSubscriptions) {
              custSubscriptions.forEach(
                function (custSubscription) {
                  var subscriptionLicenses = custSubscription.licenses;

                  if (null != subscriptionLicenses) {
                    orgWebexLicenses = orgWebexLicenses.concat(subscriptionLicenses);
                  }
                }
              );
            }
          }
        );
      }

      return orgWebexLicenses;
    }; // getOrgWebexLicenses()

    obj.getAllSitesWebexLicenseInfo = function () {
      var deferredGetWebexLicenseInfo = $q.defer();

      Auth.getCustomerAccount(Authinfo.getOrgId()).then(
        function getValidLicensesSuccess(response) {
          var funcName = 'getValidLicensesSuccess()';
          var logMsg = '';

          var licenses = obj.getOrgWebexLicenses(response);

          // logMsg = funcName + ": " + "\n" +
          //   "licenses=" + JSON.stringify(licenses);
          // $log.log(logMsg);

          var allSitesLicenseInfo = [];

          if (0 >= licenses.size) {
            logMsg = funcName + '\n' +
              'ERROR - no org licenses found in Atlas!' + '\n' +
              'licenses=' + JSON.stringify(licenses);
            $log.log(logMsg);
          } else {
            licenses.forEach(
              function checkLicense(license) {
                if (
                  ('CONFERENCING' == license.licenseType) ||
                  ('CMR' == license.licenseType)
                ) {
                  var capacity = license.capacity;
                  var licenseFields = license.licenseId.split('_');
                  var webexSite = licenseFields[licenseFields.length - 1];
                  var offerCode = licenseFields[0];

                  var licenseInfo = {
                    webexSite: webexSite,
                    offerCode: offerCode,
                    capacity: capacity,
                  };

                  allSitesLicenseInfo.push(licenseInfo);
                }
              } // checkLicense()
            ); // licenses.forEach()
          }

          if (0 < allSitesLicenseInfo.length) {
            deferredGetWebexLicenseInfo.resolve(allSitesLicenseInfo);
          } else {
            deferredGetWebexLicenseInfo.reject(allSitesLicenseInfo);
          }
        }, // getValidLicensesSuccess()

        function getValidLicensesError(info) {
          var funcName = 'getValidLicensesError()';
          var logMsg = '';

          logMsg = funcName + ': ' + '\n' +
            'info=' + JSON.stringify(info);
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
      var promise = null;
      var siteUrl = $rootScope.lastSite;

      if (_.isUndefined(siteUrl)) {
        $log.log('No WebEx site visited.');
        var deferred = $q.defer();
        deferred.resolve('OK');
        promise = deferred.promise;
      } else {
        var siteName = obj.getSiteName(siteUrl);
        var logoutUrl = 'https://' + $rootScope.nginxHost + '/wbxadmin/clearcookie.do?proxyfrom=atlas&siteurl=' + siteName.toLowerCase();

        $log.log('Logout from WebEx site ' + siteName + ', ' + logoutUrl);

        var jqpromise = $.ajax({
          type: 'POST',
          url: logoutUrl,
          data: $.param({
            ngxsiteurl: siteUrl.toLowerCase(),
          }),
          xhrFields: {
            withCredentials: true,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 250,
        });

        promise = $q.resolve(jqpromise); //convert into angularjs promise
      }

      return promise;
    }; // logoutSite()

    obj.utf8ToUtf16le = function (data) {
      // var funcName = "utf8ToUtf16le()";
      // var logMsg = "";

      // logMsg = funcName + "\n" +
      //   "data=" + data;
      // $log.log(logMsg);

      var intBytes = [];

      var utf16leHeader = '%ff%fe';

      utf16leHeader.replace(/([0-9a-f]{2})/gi, function (byte) {
        intBytes.push(parseInt(byte, 16));
      });

      for (var i = 0; i < data.length; ++i) {
        var hexChar = data[i].charCodeAt(0);

        var hexByte1 = hexChar & 0xff;
        var hexByte2 = (hexChar >> 8) & 0xff;

        var intByte1 = parseInt(hexByte1.toString(16), 16);
        var intByte2 = parseInt(hexByte2.toString(16), 16);

        intBytes.push(intByte1);
        intBytes.push(intByte2);
      }

      // logMsg = funcName + "\n" +
      //   "intBytes=" + intBytes;
      // $log.log(logMsg);

      return intBytes;
    }; // utf8ToUtf16le()

    return obj;
  } // webexUtilsFact()

  module.exports = WebExUtilsFact;
})();
