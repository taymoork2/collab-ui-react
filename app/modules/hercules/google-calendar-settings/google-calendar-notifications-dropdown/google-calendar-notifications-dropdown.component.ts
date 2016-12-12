class GoogleCalendarNotificationsDropdownCtrl implements ng.IComponentController {
  /* @ngInject */
  constructor() {}
}

export class GoogleCalendarNotificationsDropdownComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarNotificationsDropdownCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-notifications-dropdown/google-calendar-notifications-dropdown.html';
}
