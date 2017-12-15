import './my-subscription.scss';
import digitalRiverModule from 'modules/online/digitalRiver/index';
import notificationModule from 'modules/core/notifications/index';
import onlineUpgradeModule from 'modules/online/upgrade/index';
import proPackModule from 'modules/core/proPack/index';
import sharedMeetingModule from './sharedMeetings/index';
import webexUtilsModule from 'modules/webex/utils/index';
import { MySubscriptionCtrl } from './mySubscription.controller';
import { SubscriptionRowComponent } from './subscription-row/subscriptionRow.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscriptionDetails.component';

export default angular
  .module('myCompany.subscriptions', [
    digitalRiverModule,
    notificationModule,
    onlineUpgradeModule,
    proPackModule,
    sharedMeetingModule,
    webexUtilsModule,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/service-descriptor.service').default,
    require('modules/hercules/services/hybrid-services-utils.service').default,
    require('collab-ui-ng').default,
  ])
  .controller('MySubscriptionCtrl', MySubscriptionCtrl)
  .component('subscriptionRow', new SubscriptionRowComponent())
  .component('subscriptionDetails', new SubscriptionDetailsComponent())
  .name;
