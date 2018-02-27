import CalendarCloudConnectorServiceModuleName, { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import HybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import FlagServiceModuleName, { HybridServicesFlagService } from 'modules/hercules/services/hs-flag-service';
import { BadgeType, IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
import HybridServicesUtilsServiceModuleName, { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class OverviewAllHybridCalendarsNotification {

  public createNotification($state: ng.ui.IStateService,
                            CloudConnectorService: CloudConnectorService,
                            ServiceDescriptorService: ServiceDescriptorService,
                            HybridServicesFlagService: HybridServicesFlagService,
                            HybridServicesUtilsService: HybridServicesUtilsService): ng.IPromise<IOverviewPageNotification> {

    const promises: ng.IPromise<any>[] = [
      ServiceDescriptorService.isServiceEnabled('squared-fusion-cal'),
      CloudConnectorService.getService('squared-fusion-gcal'),
      CloudConnectorService.getService('squared-fusion-o365'),
    ];
    const badgeType: BadgeType = 'success';
    let extendedText: string;

    return HybridServicesUtilsService.allSettled(promises)
      .then((response) => {
        if (_.every(response as any, { status: 'fulfilled' })) {
          if (response[0].value && !response[1].value.setup && !response[2].value.setup) {
            // only Expressway-based is setup
            extendedText = 'homePage.setUpAllCalendarsOnlyExpresswayBasedIsSetup';
          } else if (response[0].value && !response[1].value.setup && response[2].value.setup) {
            // both Expressway-based and Google are setup
            extendedText = 'homePage.setUpAllCalendarsExpresswayBasedAndGoogleAreSetup';
          } else if (response[0].value && response[1].value.setup && !response[2].value.setup) {
            // both Expressway-based and Office365 are setup
            extendedText = 'homePage.setUpAllCalendarsExpresswayBasedAndOffice365AreSetup';
          } else if (!response[0].value && !response[1].value.setup && response[2].value.setup) {
            // Only Office 365 is setup
            extendedText = 'homePage.setUpAllCalendarsOnlyOffice365IsSetup';
          } else if (!response[0].value && response[1].value.setup && !response[2].value.setup) {
            // Only Google Calendar is setup
            extendedText = 'homePage.setUpAllCalendarsOnlyGoogleIsSetup';
          } else if (!response[0].value && response[1].value.setup && response[2].value.setup) {
            // both Office 365 and Google Calendar are setup
            extendedText = 'homePage.setUpAllCalendarsGoogleAndOffice365AreSetup';
          } else if (!response[0].value && !response[1].value.setup && !response[2].value.setup) {
            // Nothing is set up
            extendedText = 'homePage.setUpAllCalendarsNoneIsSetup';
          } else {
           // everything is already set up. Reject.
            throw new Error('Hybrid Calendar already set up');
          }
        } else {
          // Something went wrong. Let's just reject instead of building a partial result.
          throw new Error('Could not reach one or more services');
        }
        return {
          badgeText: 'common.new',
          badgeType: badgeType,
          canDismiss: true,
          dismiss: () => HybridServicesFlagService.raiseFlag('atlas.notification.squared-fusion-all-calendars.acknowledged'),
          link: () => $state.go('services-overview'),
          linkText: 'homePage.getStarted',
          name: 'hybridCalendars',
          text: 'homePage.setUpCalendarService',
          extendedText: extendedText,
        };

      });

  }

}

export default angular
  .module('hercules-all-hybrid-calendars-notification', [
    require('angular-ui-router'),
    CalendarCloudConnectorServiceModuleName,
    HybridServicesClusterServiceModuleName,
    FlagServiceModuleName,
    HybridServicesUtilsServiceModuleName,
  ])
  .service('OverviewAllHybridCalendarsNotification', OverviewAllHybridCalendarsNotification)
  .name;
