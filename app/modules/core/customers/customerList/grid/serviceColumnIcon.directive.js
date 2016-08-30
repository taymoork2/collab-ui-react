(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crServiceColumnIcon', serviceColumnIcon);

  function serviceColumnIcon($interpolate, $sanitize, $templateCache, $translate, Config, PartnerService) {
    var directive = {
      restrict: 'E',
      scope: {
        type: '@',
        row: '='
      },
      templateUrl: 'modules/core/customers/customerList/grid/serviceColumnIcon.tpl.html',
      link: link
    };

    function link(scope) {
      scope.translateTypeToIcon = translateTypeToIcon;
      scope.getTooltipText = getTooltipText;
      scope.isVisible = PartnerService.isLicenseTypeAny(scope.row, scope.type);
      // caching some of the expensive and repeated operations
      scope.TOOLTIP_TEMPLATE = $($templateCache.get('modules/core/customers/customerList/grid/serviceIconTooltip.tpl.html'));
      scope.WEBEX_TRANSLATION = $translate.instant('customerPage.webex');
      scope.TOOLTIP_TEMPLATE_BLOCK = $($templateCache.get('modules/core/customers/customerList/grid/webexTooltipBlock.tpl.html'));
      var MAX_SITES_DISPLAYED = 2;
      var WEBEX_TYPE = 'webex'; // use this to stand for all types of webex products
      var POSSIBLE_SERVICE_STATUSES = {
        expired: 'expired',
        trial: 'trial',
        purchased: 'purchased',
        free: 'free',
        noInfo: 'licenseInfoNotAvailable'
      };
      var TYPE_TO_TRANSLATION_CONVERSIONS = {
        // an unfortunate requirement since (some of) the translations don't match the object names
        messaging: 'message',
        communications: 'call',
        conferencing: 'meeting'
      };

      // necessary to call this function due to the way that both toolkit's tooltip works
      // as well as how UI-grid works.
      function getTooltipText(rowData, type) {
        type = $sanitize(type);
        if (type === WEBEX_TYPE) {
          return getWebexTooltip(rowData, type);
        } else {
          var tooltip = scope.TOOLTIP_TEMPLATE.clone();
          var serviceStatus = getServiceStatus(rowData, type);
          var tooltipDataObj = {
            statusClass: serviceStatus
          };
          if (TYPE_TO_TRANSLATION_CONVERSIONS[type]) {
            tooltipDataObj.serviceName = $translate.instant('customerPage.' + TYPE_TO_TRANSLATION_CONVERSIONS[type]);
          } else {
            tooltipDataObj.serviceName = $translate.instant('customerPage.' + type);
          }
          if (serviceStatus !== POSSIBLE_SERVICE_STATUSES.free && rowData[type].volume) {
            tooltipDataObj.qty = $translate.instant('customerPage.quantityWithValue', {
              quantity: rowData[type].volume
            });
          }
          tooltipDataObj.status = $translate.instant('customerPage.' + serviceStatus);
          // Note that the tooltip displays raw html, which can contain unsecure code!
          // In this case all input is put through $translate, sanitized, or changed to a constant
          return $interpolate(tooltip[0].outerHTML)(tooltipDataObj);
        }
      }

      function getWebexTooltip(rowData) {
        var tooltip = scope.TOOLTIP_TEMPLATE.clone();
        tooltip.find('.service-name').text(scope.WEBEX_TRANSLATION);
        tooltip.find('.tooltip-qty').remove();
        tooltip.find('.service-status').remove();
        var webexServicesCounted = 0;
        var sitesFound = [];
        _.forEach(Config.webexTypes, function (licenseType) {
          var licenseData = rowData[licenseType];
          var isLicenseAny = PartnerService.isLicenseTypeAny(rowData, licenseType);
          var hasLicenseId = angular.isDefined(licenseData.licenseId);
          var isUniqueUrl = !_.includes(sitesFound, licenseData.siteUrl);

          if (isLicenseAny && hasLicenseId && isUniqueUrl) {
            if (webexServicesCounted < MAX_SITES_DISPLAYED) {
              sitesFound.push(licenseData.siteUrl);
              tooltip.append(createWebexTooltipBlock(rowData, licenseType, licenseData, sitesFound));
            }
            webexServicesCounted++;
          }
        });
        if (webexServicesCounted > MAX_SITES_DISPLAYED) {
          var additionalSiteCount = $translate.instant('customerPage.webexSiteCount', {
            count: webexServicesCounted - MAX_SITES_DISPLAYED
          }, 'messageformat');
          tooltip.append('<p class="service-text">' + additionalSiteCount + '</p>');
        }
        return $interpolate(tooltip[0].outerHTML)();
      }

      function createWebexTooltipBlock(rowData, licenseType, licenseData) {
        var tooltipBlock = scope.TOOLTIP_TEMPLATE_BLOCK.clone();
        var serviceStatus = getServiceStatus(rowData, licenseType);
        var tooltipDataObj = {
          url: licenseData.siteUrl,
          qty: $translate.instant('customerPage.quantityWithValue', {
            quantity: licenseData.volume
          }),
          statusClass: serviceStatus,
          status: $translate.instant('customerPage.' + serviceStatus)
        };
        return $interpolate(tooltipBlock[0].outerHTML)(tooltipDataObj);
      }

      function getServiceStatus(rowData, type) {
        // note that this logic is slightly different than the logic in getAccountStatus within CustomerListCtrl
        // This service status can include free, whereas account status cannot
        var licenseList = rowData.licenseList;
        var serviceData = rowData[type];
        if (serviceData.daysLeft < 0) {
          return POSSIBLE_SERVICE_STATUSES.expired;
        }
        if (checkForLicenseStatus(PartnerService.isLicenseATrial, licenseList, serviceData)) {
          return POSSIBLE_SERVICE_STATUSES.trial;
        } else if (checkForLicenseStatus(PartnerService.isLicenseActive, licenseList, serviceData)) {
          return POSSIBLE_SERVICE_STATUSES.purchased;
        } else if (checkForLicenseStatus(PartnerService.isLicenseFree, licenseList, serviceData)) {
          return POSSIBLE_SERVICE_STATUSES.free;
        }
        return POSSIBLE_SERVICE_STATUSES.noInfo;
      }

      function checkForLicenseStatus(licenseStatusFunction, licenseList, serviceData) {
        return PartnerService.isLicenseInfoAvailable(licenseList) && licenseStatusFunction(serviceData);
      }

      function translateTypeToIcon(type) {
        // Converts the trial type to a css icon representing that icon
        switch (type) {
          case 'messaging':
            return 'icon-message';
          case 'conferencing':
            return 'icon-conference';
          case 'communications':
            return 'icon-phone';
          case 'webex':
            return 'icon-webex';
          case 'roomSystems':
            return 'icon-devices';
          case 'care':
            return 'icon-headset';
        }
      }
    }

    return directive;
  }
})();
