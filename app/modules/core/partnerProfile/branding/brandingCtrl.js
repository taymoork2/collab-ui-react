/* @ngInject */
module.exports = function BrandingCtrl($log, $state, $modal, $scope, $translate, $timeout,
  Authinfo, Notification, Log, UserListService, WebexClientVersion, BrandService, Orgservice) {

  var brand = this;
  var orgId = Authinfo.getOrgId();

  brand.isPartner = Authinfo.isPartner();
  brand.usePartnerLogo = true;
  brand.allowCustomerLogos = false;
  brand.progress = 0;
  brand.isDirectCustomer = Authinfo.isDirectCustomer();
  brand.logoCriteria = {
    'pattern': '.png',
    'width': {
      min: '100',
    },
    'size': {
      max: '1MB',
    },
  };

  brand.useLatestWbxVersion = false;
  brand.wbxclientversionselected = '';
  brand.wbxclientVersionInvalid = false;
  brand.wbxclientVersionInvalidError = '';
  brand.wbxclientversions = ['testversion1.0', 'testversion2.0'];
  brand.wbxNoClientSelected = true;
  brand.wbxclientversionplaceholder = $translate.instant('partnerProfile.selectAWbxClientVersion');
  brand.showClientVersions = true;

  brand.init = function () {
    Log.debug('branding init');
    brand.rep = null; // cs admin rep
    brand.partner = {};

    brand.logoUrl = '';
    brand.logoError = null;

    UserListService.listPartners(orgId, function (data) {
      for (var partner in data.partners) {
        var currentPartner = data.partners[partner];
        if (!brand.isPartner && currentPartner.userName.indexOf('@cisco.com') === -1) {
          brand.partner = currentPartner;

        } else if (currentPartner.userName.indexOf('@cisco.com') > -1) {
          brand.rep = currentPartner;
        }
      }
    });

    var params = {
      disableCache: true,
      basicInfo: true,
    };
    Orgservice.getOrg(function (data, status) {
      if (data.success) {
        var settings = data.orgSettings;
        if (!_.isUndefined(settings.usePartnerLogo)) {
          brand.usePartnerLogo = settings.usePartnerLogo;
        }

        if (!_.isUndefined(settings.allowCustomerLogos)) {
          brand.allowCustomerLogos = settings.allowCustomerLogos;
        }

        if (!_.isUndefined(settings.logoUrl)) {
          brand.logoUrl = settings.logoUrl;
        }

      } else {
        Log.debug('Get existing org failed. Status: ' + status);
      }

    }, orgId, params);

    BrandService.getLogoUrl(orgId).then(function (logoUrl) {
      brand.tempLogoUrl = logoUrl;
    });

    brand.initWbxClientVersions();
  };

  // TODO webex team clean bCtrl up and add unit tests
  brand.initWbxClientVersions = function () {
    var funcName = "brand.initWbxClientVersions()";
    var logMsg = "";

    //nothing to do on error.
    WebexClientVersion.getWbxClientVersions().then(
      function (data) {
        brand.wbxclientversions = data;
      }
    );

    var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
      return WebexClientVersion.getTemplate(_.get(resp, 'data.partnerId'));
    });

    //var p = WebexClientVersion.getTemplate(orgId)

    p.then(function (json) {
      var clientVersion = _.get(json, 'data.clientVersion');
      var useLatest = _.get(json, 'data.useLatest');
      var validClientVersion = false;
      var updateDb = false;

      if (
        (null == clientVersion) ||
        ('latest' === clientVersion)
      ) {

        clientVersion = '';
        updateDb = true;
      }

      if ('' != clientVersion) {
        // clientVersion = "somethingInvalid";

        brand.wbxclientversions.forEach(
          function (wbxclientversion) {
            if (
              (!validClientVersion) &&
              (wbxclientversion == clientVersion)
            ) {

              validClientVersion = true;
            }
          }
        );

        if (!validClientVersion) {
          logMsg = funcName + "\n" +
            "ERROR: " + "selected clientversion=" + clientVersion + " is invalid.";
          $log.log(logMsg);

          // clientVersion = '';
          // updateDb = true;

          brand.wbxclientVersionInvalid = true;
          brand.wbxclientVersionInvalidError = $translate.instant(
            'partnerProfile.webExClientVersionInvalid',
            {
              clientVersion: clientVersion,
            }
          );

          /*
          Notification.errorResponse(
            '',
            brand.wbxclientVersionInvalidError
          );
          */
        }
      }

      if (
        ('' == clientVersion) &&
        (!useLatest)
      ) {

        useLatest = true;
        updateDb = true;
      }

      if (updateDb) {
        logMsg = funcName + "\n" +
          "Updating d/b" + "\n" +
          "clientVersion=" + clientVersion + "\n" +
          "useLatest=" + useLatest;
        $log.log(logMsg);

        WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
          return resp.data.partnerId; //bCtrl is the pid
        }).then(function (pid) {
          WebexClientVersion.postOrPutTemplate(
            pid,
            clientVersion,
            useLatest
          );
        });
      }

      if ('' == clientVersion) {
        brand.wbxNoClientSelected = true;
        brand.wbxclientversionselected = brand.wbxclientversionplaceholder;
      } else {
        brand.wbxNoClientSelected = false;
        brand.wbxclientversionselected = clientVersion;
      }

      brand.useLatestWbxVersion = useLatest;
    });
  };

  brand.init();

  function toggleWebexSelectLatestVersionAlways(useLatest) {
    Log.info("webex use latest version toggle");

    brand.useLatestWbxVersion = useLatest;

    var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
      return resp.data.partnerId; //bCtrl is the pid
    }).then(function (pid) {
      return WebexClientVersion.postOrPutTemplate(
        pid,
        brand.wbxclientversionselected,
        brand.useLatestWbxVersion
      );
    });

    p.then(function () {
      if (useLatest) {
        Notification.success('partnerProfile.webexVersionUseLatestTrue');
      } else {
        Notification.success('partnerProfile.webexVersionUseLatestFalse');
      }
    }).catch(function (response) {
      Notification.errorResponse(response, 'partnerProfile.webexVersionUseLatestUpdateFailed');
    });
  }

  function wbxclientversionselectchanged(wbxclientversionselected) {
    Log.info("Webex selected version changed");

    brand.wbxclientversionselected = wbxclientversionselected;

    var p = WebexClientVersion.getPartnerIdGivenOrgId(orgId).then(function (resp) {
      return resp.data.partnerId; //bCtrl is the pid
    }).then(function (pid) {
      return WebexClientVersion.postOrPutTemplate(
        pid,
        brand.wbxclientversionselected,
        brand.useLatestWbxVersion
      );
    });

    //var p = WebexClientVersion.postOrPutTemplate(orgId, wbxclientversionselected, brand.useLatestWbxVersion);

    Log.info("New version selected is " + wbxclientversionselected);

    p.then(function () {
      brand.wbxclientVersionInvalid = false;
      Notification.success('partnerProfile.webexClientVersionUpdated');
    }).catch(function (response) {
      Notification.errorResponse(response, 'partnerProfile.webexClientVersionUpdatedFailed');
    });
  }

  brand.wbxclientversionselectchanged = wbxclientversionselectchanged;

  brand.wbxclientversionselectchanged = _.debounce(
    wbxclientversionselectchanged,
    2000, {
      'leading': true,
      'trailing': false,
    });

  brand.toggleWebexSelectLatestVersionAlways = _.debounce(
    toggleWebexSelectLatestVersionAlways,
    100, {
      'leading': true,
      'trailing': false,
    });

  brand.upload = function (file) {
    if (validateLogo(file)) {
      openModal();
      brand.progress = 0;
      BrandService.upload(orgId, file)
        .then(uploadSuccess, uploadError, uploadProgress);
    }
  };

  function openModal() {
    brand.uploadModal = $modal.open({
      type: 'small',
      scope: $scope,
      modalClass: 'modal-logo-upload',
      templateUrl: 'modules/core/partnerProfile/branding/brandingUpload.tpl.html',
    });
  }

  brand.toggleLogo = _.debounce(function (value) {
    if (value) {
      BrandService.usePartnerLogo(orgId);
    } else {
      BrandService.useCustomLogo(orgId);
    }
  }, 2000, {
    'leading': true,
    'trailing': false,
  });

  brand.toggleAllowCustomerLogos = _.debounce(function (value) {
    if (value) {
      BrandService.enableCustomerLogos(orgId);
    } else {
      BrandService.disableCustomerLogos(orgId);
    }
  }, 2000, {
    'leading': true,
    'trailing': false,
  });

  // Add branding example static page
  brand.showBrandingExample = function (type) {
    $state.go('brandingExample', {
      modalType: type,
    });
  };

  function validateLogo(logo) {
    // avoid sencond click upload panel, trigger upload direct,
    if (!logo) {
      return false;
    }

    var error = logo.$error;
    if (error === 'maxWidth' || error === 'minWidth') {
      brand.logoError = 'dimensions';
    } else if (error === 'minSize' || error === 'maxSize') {
      brand.logoError = 'size';
    } else {
      brand.logoError = logo.$error;
    }

    if (logo && !logo.$error) {
      return true;
    } else {
      openModal();
    }
  }

  function uploadSuccess() {
    var orgId = Authinfo.getOrgId();
    $timeout(function () {
      if (brand.uploadModal) {
        brand.uploadModal.close();
      }
    }, 3000);
    // Automatically start using the custom logo
    BrandService.resetCdnLogo(orgId).then(function () {
      BrandService.getLogoUrl(orgId).then(function (logoUrl) {
        brand.tempLogoUrl = logoUrl;
        brand.usePartnerLogo = false;
        brand.toggleLogo(false);
      }).catch(uploadError);
    }).catch(uploadError);
  }

  function uploadError(response) {
    var errorKey;
    brand.logoFile = null;
    if (brand.uploadModal) {
      brand.uploadModal.close();
    }
    if (_.get(response, 'data.name') === 'SecurityError') {
      errorKey = 'partnerProfile.imageUploadFailedSecurity';
    } else {
      errorKey = 'partnerProfile.imageUploadFailed';
    }
    Notification.errorResponse(response, errorKey);
  }

  function uploadProgress(evt) {
    brand.progress = parseInt((100.0 * evt.loaded) / evt.total, 10);
  }
};
