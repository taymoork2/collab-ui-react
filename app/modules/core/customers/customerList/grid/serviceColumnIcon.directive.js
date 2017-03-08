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
        row: '=',
      },
      templateUrl: 'modules/core/customers/customerList/grid/serviceColumnIcon.tpl.html',
      link: link,
    };

    function link(scope) {
      scope.translateTypeToIcon = translateTypeToIcon;
      scope.getTooltipText = getTooltipText;
      _setVisibility(scope);
      scope.$watch('row', _.throttle(function () {
        // When filtering, directives aren't "re-linked", so recalculate this
        _setVisibility(scope);
      }, 25));
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
        noInfo: 'licenseInfoNotAvailable',
      };
      var TYPE_TO_TRANSLATION_CONVERSIONS = {
        // an unfortunate requirement since (some of) the translations don't match the object names
        messaging: 'message',
        communications: 'call',
        conferencing: 'meeting',
        roomSystems: 'roomSystem',
      };

      // necessary to call this function due to the way that both toolkit's tooltip works
      // as well as how UI-grid works.
      function getTooltipText(rowData, type) {
        type = $sanitize(type);
        if (type === WEBEX_TYPE) {
          return getWebexTooltip(rowData, type);
        } else {
          return getNonWebexTooltip(rowData, type);
        }

      }

      function getNonWebexTooltip(rowData, type) {
        var tooltip = scope.TOOLTIP_TEMPLATE.clone();
        var serviceStatus = getServiceStatus(rowData, type);
        var serviceManagedByAnotherPartner = !PartnerService.isServiceManagedByCurrentPartner(rowData[type]);
        var tooltipDataObj = {
          statusClass: serviceStatus,
        };

        if (TYPE_TO_TRANSLATION_CONVERSIONS[type]) {
          tooltipDataObj.serviceName = $translate.instant('customerPage.' + TYPE_TO_TRANSLATION_CONVERSIONS[type]);
        } else {
          tooltipDataObj.serviceName = $translate.instant('customerPage.' + type);
        }
        if (serviceStatus !== POSSIBLE_SERVICE_STATUSES.free && rowData[type].volume) {
          tooltipDataObj.qty = $translate.instant('customerPage.quantityWithValue', {
            quantity: rowData[type].volume });
        }
        tooltipDataObj.status = $translate.instant('customerPage.' + serviceStatus);
        if (serviceManagedByAnotherPartner && serviceStatus !== POSSIBLE_SERVICE_STATUSES.free && rowData[type].volume) {
          tooltipDataObj.anotherPartner = $translate.instant('customerPage.anotherPartner');
        }
        // Note that the tooltip displays raw html, which can contain unsecure code!
        // In this case all input is put through $translate, sanitized, or changed to a constant
        return $interpolate(tooltip[0].outerHTML)(tooltipDataObj);
      }

      function getWebexTooltip(rowData) {
        var tooltip = scope.TOOLTIP_TEMPLATE.clone();
        tooltip.find('.service-name').text(scope.WEBEX_TRANSLATION);
        tooltip.find('.tooltip-qty').remove();
        tooltip.find('.service-status').remove();
        tooltip.find('.tooltip-another-partner').remove();
        var webexServicesCounted = 0;
        var sitesFound = [];
        var webexTypes = _.without(Config.webexTypes, 'webexCMR');
        _.forEach(webexTypes, function (licenseType) {
          var licenseData = rowData[licenseType];
          var isLicenseAny = PartnerService.isLicenseTypeAny(rowData, licenseType);
          var hasLicenseId = !_.isUndefined(licenseData.licenseId);
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
            count: webexServicesCounted - MAX_SITES_DISPLAYED,
          }, 'messageformat');
          tooltip.append('<p class="service-text">' + additionalSiteCount + '</p>');
        }
        return $interpolate(tooltip[0].outerHTML)();
      }

      function createWebexTooltipBlock(rowData, licenseType, licenseData) {
        var tooltipBlock = scope.TOOLTIP_TEMPLATE_BLOCK.clone();
        var serviceStatus = getServiceStatus(rowData, licenseType);
        var serviceManagedByAnotherPartner = !PartnerService.isServiceManagedByCurrentPartner(rowData[licenseType]);
        var tooltipDataObj = {
          url: licenseData.siteUrl,
          qty: $translate.instant('customerPage.quantityWithValue', {
            quantity: licenseData.volume,
          }),
          statusClass: serviceStatus,
          status: $translate.instant('customerPage.' + serviceStatus),
        };

        if (serviceManagedByAnotherPartner && serviceStatus !== POSSIBLE_SERVICE_STATUSES.free && rowData[licenseType].volume) {
          tooltipDataObj.anotherPartner = $translate.instant('customerPage.anotherPartner');
        }

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
          case 'sparkBoard':
            return 'icon-whiteboard';
          case 'care':
            return 'icon-headset';
        }
      }

      function _isVisible(row, type, collection) {
        return PartnerService.isLicenseTypeAny(row, type) && collection.indexOf(type) !== -1;
      }

      function _setVisibility(scope) {
        scope.showServiceManagedByCurrentPartner = _isVisible(scope.row, scope.type,
          scope.row.orderedServices.servicesManagedByCurrentPartner);
        scope.showServiceManagedByAnotherPartner = _isVisible(scope.row, scope.type,
          scope.row.orderedServices.servicesManagedByAnotherPartner);
      }
    }

    return directive;
  }
})();
