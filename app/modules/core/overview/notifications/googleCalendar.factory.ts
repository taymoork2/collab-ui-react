export class OverviewGoogleCalendarNotification {

  public createNotification($modal, $state, Orgservice) {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => {
        Orgservice.setHybridServiceAcknowledged('google-calendar-service');
      },
      link: () => {
        $modal.open({
          controller: 'FirstTimeGoogleSetupController',
          controllerAs: 'vm',
          templateUrl: 'modules/hercules/service-settings/calendar-service-setup/first-time-google-setup.html',
        })
        .result
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
