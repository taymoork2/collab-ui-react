import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
const notificationOrder = [
  'alert',
  'todo',
  'info',
  'new',
];

export class CardNotificationsComponent implements ng.IComponentOptions {
  public controller = CardNotificationsCtrl;
  public template = require('./card-notifications.component.html');
  public bindings = {
    notifications: '<',
    dismissNotificationFn: '&',
  };
}

export class CardNotificationsCtrl implements ng.IComponentController {
  public dismissNotificationFn: Function;
  public notifications: IOverviewPageNotification[];

  public dismissNotification(notification: IOverviewPageNotification): void {
    this.dismissNotificationFn({ notification: notification });
  }

  // used to sort notifications in a specific order
  public notificationComparator(a, b): number {
    if (a.type === 'number') {
      return b.value - a.value;
    }

    const v1 = _.toLower(_.last(_.split(a.value, '.')));
    const v2 = _.toLower(_.last(_.split(b.value, '.')));
    if (_.isEqual(v1, v2)) {
      return 0;
    } else {
      return (_.indexOf(notificationOrder, v1) < _.indexOf(notificationOrder, v2)) ? -1 : 1;
    }
  }
}
