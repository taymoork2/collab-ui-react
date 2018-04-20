import { HybridServicesFlagService } from 'modules/hercules/services/hs-flag-service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
import FlagServiceModuleName from 'modules/hercules/services/hs-flag-service';
import HybridServicesUtilServiceModuleName from 'modules/hercules/services/hybrid-services-utils.service';

export class OverviewHybridMessagingNotification {

  public createNotification($state: ng.ui.IStateService, HybridServicesFlagService: HybridServicesFlagService, HybridServicesUtilsService: HybridServicesUtilsService): IOverviewPageNotification {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => HybridServicesFlagService.raiseFlag(HybridServicesUtilsService.getAckFlagForHybridServiceId('spark-hybrid-impinterop')),
      link: () => $state.go('services-overview'),
      linkText: 'homePage.getStarted',
      name: 'hybridMessaging',
      text: 'homePage.setUpHybridMessaging',
    };
  }

}

export default angular
  .module('hercules-hybrid-messaging-notification', [
    require('angular-ui-router'),
    FlagServiceModuleName,
    HybridServicesUtilServiceModuleName,
  ])
  .service('OverviewHybridMessagingNotification', OverviewHybridMessagingNotification)
  .name;
