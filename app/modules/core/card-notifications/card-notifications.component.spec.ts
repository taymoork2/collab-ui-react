import testModule from './index';
import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

describe('Component: card-notification-component', () => {
  const DISMISS_BUTTON = 'button';
  const notifications: IOverviewPageNotification[] = getJSONFixture('core/json/card-notifications/card-notifications.json');
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$filter',
    );

    this.TOTAL_NOTIFICATIONS = notifications.length;

    _.forEach(notifications, (notification) => {
      notification.dismiss = _.noop;
      notification.link = _.noop;
    });

    this.compileComponent('cardNotifications', {
      notifications: notifications,
      dismissNotificationFn: _.noop,
    });
  });

  it('should return correct sort values', function () {
    // ensure comparator sorts correctly
    const sorted = this.$filter('orderBy')([
      { badgeText: 'common.info' },
      { badgeText: 'common.new' },
      { badgeText: 'common.alert' },
      { badgeText: 'homePage.todo' },
      { badgeText: 'common.info' },
      { badgeText: 'common.alert' },
    ], 'badgeText', false, this.controller.notificationComparator);

    expect(sorted).toEqual([
      { badgeText: 'common.alert' },
      { badgeText: 'common.alert' },
      { badgeText: 'homePage.todo' },
      { badgeText: 'common.info' },
      { badgeText: 'common.info' },
      { badgeText: 'common.new' },
    ]);
  });

  it('should sort notifications by zOrder', function () {

    // Should have added all the extra notifications
    expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

    // ensure comparator sorts correctly
    let sorted: IOverviewPageNotification[] = this.$filter('orderBy')(this.controller.notifications, ['badgeText', 'zOrder'], false, this.controller.notificationComparator);

    // 'common.new' badge sorting expectations...
    expect(_.find(sorted, { badgeText: 'common.new' }).extendedText).toBe('highest');
    expect(sorted[_.findIndex(sorted, { extendedText: 'highest' }) + 1].extendedText).toBe('nextHighest');
    expect(_.last(sorted).extendedText).toBe('lowest');

    // 'common.info' badge sorting -- these should go LIFO
    expect(_.find(sorted, { badgeText: 'common.info' }).extendedText).toBe('ten_dupe_param_zOrder');
    expect(sorted[_.findIndex(sorted, { extendedText: 'ten_dupe_param_zOrder' }) + 1].extendedText).toBe('ten_dupe');
    expect(sorted[_.findIndex(sorted, { extendedText: 'ten_dupe_param_zOrder' }) + 2].extendedText).toBe('ten');
    expect(sorted[_.findIndex(sorted, { extendedText: 'ten_dupe_param_zOrder' }) + 3].extendedText).toBe('override_five');

    // Should set zOrder with passed param
    expect(_.find(sorted, { extendedText: 'ten_dupe_param_zOrder' }).zOrder).toBe(1010);
    // Should override zOrder with passed param
    expect(_.find(sorted, { extendedText: 'override_five' }).zOrder).toBe(1005);

    // garbage collect
    sorted = [];
  });

  it('should call dismiss notification function', function () {
    spyOn(this.controller, 'dismissNotificationFn');
    this.view.find(DISMISS_BUTTON).click();
    expect(this.controller.dismissNotificationFn).toHaveBeenCalled();
  });
});
