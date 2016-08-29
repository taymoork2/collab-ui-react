(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crServiceColumnIcon', serviceColumnIcon);

  function serviceColumnIcon($translate) {
    var directive = {
      restrict: 'E',
      scope: {
        type: '@',
        app: '=',
        row: '='
      },
      templateUrl: 'modules/core/customers/customerList/grid/serviceColumnIcon.tpl.html',
      link: link
    };

    function link(scope) {
      scope.translateTypeToIcon = translateTypeToIcon;
      scope.getTooltipText = getTooltipText;
      var webexType = 'webex'; // use this to stand for all types of webex products
      var possibleServiceStatuses = {
        expired: 'expired',
        trial: 'trial',
        purchased: 'purchased',
        free: 'free',
        noInfo: 'licenseInfoNotAvailable'
      };

      function getTooltipText(rowData, type, app) {
        var serviceStatus = getServiceStatus(rowData, type, app);
        var typeToTranslationConversions = {
          messaging: 'message',
          communications: 'call',
          conferencing: 'meeting'
        };
        var tooltipText = '';

        if (typeToTranslationConversions[type]) {
          tooltipText = $translate.instant('customerPage.' + typeToTranslationConversions[type]) + '  ';
        } else {
          tooltipText = $translate.instant('customerPage.' + type) + '  ';
        }

        if (serviceStatus !== possibleServiceStatuses.free && type !== webexType && rowData[type].volume) {
          tooltipText += $translate.instant('customerPage.quantityWithValue', {
            quantity: rowData[type].volume
          }) + '  ';
        }

        tooltipText += $translate.instant('customerPage.' + serviceStatus);
        return tooltipText;
      }

      function getServiceStatus(rowData, type, app) {
        // note that this logic is slightly different than the logic in getAccountStatus within CustomerListCtrl
        // This service status can include free, whereas account status cannot
        if (type === webexType) {
          return 'webex';  // FIXME: Temp placeholder till toolkit fix comes in
        }
        if (rowData[type].daysLeft < 0) {
          return possibleServiceStatuses.expired;
        }
        if (app.isLicenseTypeATrial(rowData, type)) {
          return possibleServiceStatuses.trial;
        } else if (app.isLicenseTypeActive(rowData, type)) {
          return possibleServiceStatuses.purchased;
        } else if (app.isLicenseTypeFree(rowData, type)) {
          return possibleServiceStatuses.free;
        }
        // This should never happen, but is a safeguard for any issues with bad data
        return possibleServiceStatuses.noInfo;
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
