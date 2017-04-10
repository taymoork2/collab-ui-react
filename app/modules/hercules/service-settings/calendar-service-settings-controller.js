(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CalendarSettingsController', CalendarSettingsController);

  /* @ngInject */
  function CalendarSettingsController($translate, Analytics) {
    var vm = this;
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.squared-fusion-cal');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNames.squared-fusion-cal');

    vm.documentationSection = {
      title: 'common.help',
    };

    Analytics.trackHSNavigation(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CAL_EXC_SETTINGS);
  }
}());
