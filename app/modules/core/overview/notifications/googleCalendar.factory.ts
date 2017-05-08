export class OverviewGoogleCalendarNotification {

  public createNotification($state, CloudConnectorService, HybridServicesFlagService, HybridServicesUtilsService) {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => {
        HybridServicesFlagService.raiseFlag(HybridServicesUtilsService.getAckFlagForHybridServiceId('squared-fusion-gcal'));
      },
      link: () => {
        CloudConnectorService.openSetupModal()
          .then(() => {
            $state.go('google-calendar-service.settings');
          });
      },
      linkText: 'homePage.getStarted',
      name: 'calendar',
      text: 'homePage.setUpGoogleCalendarService',
    };
  }
}

export default angular
  .module('Hercules')
  .service('OverviewGoogleCalendarNotification', OverviewGoogleCalendarNotification)
  .name;
