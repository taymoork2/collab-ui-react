import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IServiceDescription, ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { IMessage, IUserStatusWithExtendedMessages, USSService } from 'modules/hercules/services/uss.service';
import { IUser } from 'modules/core/auth/user/user';
import { CloudConnectorService, ICCCService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { Notification } from 'modules/core/notifications';

interface IServiceSetupStatus {
  id: HybridServiceId;
  userIsEntitled: boolean;
  enabled?: boolean;
  isSetup?: boolean;
  status: IUserStatusWithExtendedMessages;
}

class HybridServicesUserSidepanelSectionComponentCtrl implements ng.IComponentController {

  public user: IUser;
  public readonly allHybridServiceIds: HybridServiceId[] = ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec', 'spark-hybrid-impinterop'];
  private readonly callServicesinOrgerviceIds: HybridServiceId[] = ['squared-fusion-uc', 'squared-fusion-ec'];
  private allServicesinOrg: IServiceSetupStatus[] = [];
  public atlasHybridImpFeatureToggle = false;
  public userStatusLoaded = false;
  private userSubscriptionTimer: ng.IPromise<void>;
  public isLicensed;
  public googleCalendarError: string;

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private FeatureToggleService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private USSService: USSService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { user } = changes;
    if (user && user.currentValue) {
      this.user = user.currentValue;
      this.isLicensed = this.userIsLicensed();
      if (this.isLicensed) {
        this.init();
      }
    }
  }

  public $onDestroy() {
    if (!_.isUndefined(this.userSubscriptionTimer)) {
      this.$timeout.cancel(this.userSubscriptionTimer);
    }
  }

  private init(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp)
      .then((supported) => {
        this.atlasHybridImpFeatureToggle = supported;
      });
    this.allServicesinOrg = this.getServicesOrgIsEntitledTo();
    this.filterOnAllServicesInOrg();
    this.updateStatusForUser();
  }

  private filterOnAllServicesInOrg(): void {
    // Filter out services that are not enabled in FMS
    this.ServiceDescriptorService.getServices()
      .then((services: IServiceDescription[]) => {
        if (services) {
          _.forEach(this.allServicesinOrg, (service) => {
            service.enabled = this.ServiceDescriptorService.filterEnabledServices(services).some((s) => {
              return service.id === s.id && service.id !== 'squared-fusion-gcal';
            });
            service.isSetup = service.enabled;

            // Can't have Huron (ciscouc) and Hybrid Call at the same time
            if (service.id === 'squared-fusion-uc' && this.userHasEntitlement('ciscouc')) {
              service.enabled = false;
            }
          });
        }
      })
      .then(() => {
        const calServiceGoogle: IServiceSetupStatus = this.getService('squared-fusion-gcal');
        if (calServiceGoogle) {
          const calServiceExchange: IServiceSetupStatus = this.getService('squared-fusion-cal') || {};
          return this.checkCloudCalendarService(calServiceExchange, calServiceGoogle);
        }
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.readUserStatusFailed');
      });
  }

  private updateStatusForUser(): ng.IPromise<void> {
    return this.USSService.getStatusesForUser(this.user.id)
      .then(this.calculateStatusesAndWarnings)
      .then(this.subscribeToUserStatusUpdates)
      .catch((error) => {
        if (error !== 'canceled') { // just the $timeout.cancel returning. Not something to tell the user about.
          this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.readUserStatusFailed');
        }
      })
      .finally(() => {
        this.userStatusLoaded = true;
      });
  }

  private userIsLicensed(): boolean {
    return !(_.size(this.Authinfo.getLicenses()) > 0 && !this.hasCaaSLicense());
  }

  private hasCaaSLicense(): boolean {
    const licenseIDs: string[] = _.get(this.user, 'licenseID', []);
    const offerCodes: string[] = _.map(licenseIDs, (licenseString) => {
      return licenseString.split('_')[0];
    });
    return offerCodes.length > 0;
  }

  private calculateStatusesAndWarnings = (userStatuses: IUserStatusWithExtendedMessages[]): void => {
    _.forEach(this.allServicesinOrg, (service: IServiceSetupStatus) => {
      service.status = _.find(userStatuses, (status) => {
        return service.id === status.serviceId;
      });
      if (service.status && service.status.messages && service.status.state !== 'error') {
        service.status.hasWarnings = _.some(service.status.messages, (message: IMessage) => {
          return message.severity === 'warning';
        });
      }
    });
  }

  private subscribeToUserStatusUpdates = (): ng.IPromise<void> => {
    return this.userSubscriptionTimer = this.$timeout(() => {
      this.updateStatusForUser();
    }, 10000);
  }

  private checkCloudCalendarService = (calServiceExchange, calServiceGoogle): ng.IPromise<void> => {
    return this.CloudConnectorService.getService('squared-fusion-gcal')
      .then((service: ICCCService) => {
        const isSetup = service.setup;
        calServiceGoogle.isSetup = isSetup;
        const ignoreGoogle = calServiceExchange.enabled && !calServiceExchange.userIsEntitled && !calServiceGoogle.userIsEntitled;
        if (isSetup && (!calServiceExchange.enabled || !calServiceExchange.userIsEntitled) && !ignoreGoogle) {
          calServiceGoogle.enabled = true;
          calServiceExchange.enabled = false;
          if (!this.userSubscriptionTimer) {
            this.updateStatusForUser();
          }
        }
      })
      .catch((error) => {
        this.googleCalendarError = error;
      });
  }

  private getServicesOrgIsEntitledTo(): IServiceSetupStatus[] {
    return _.compact(_.map(this.allHybridServiceIds, (service: HybridServiceId) => {
      if (this.Authinfo.isEntitled(service)) {
        return {
          id: service,
          userIsEntitled: this.userHasEntitlement(service),
        };
      }
    })) as IServiceSetupStatus[];
  }

  private userHasEntitlement(entitlement: HybridServiceId | 'ciscouc'): boolean {
    if (_.isUndefined(this.user)) {
      return false;
    }
    return this.user.entitlements && this.user.entitlements.indexOf(entitlement) > -1;
  }

  public allEnabledServicesExceptUcFilter = (item: IServiceSetupStatus): boolean => {
    return item && item.enabled === true && item.id !== 'squared-fusion-ec';
  }

  public serviceIcon = (id: HybridServiceId): string => {
    return this.HybridServicesUtilsService.serviceId2Icon(id);
  }

  public getStatus(status: IUserStatusWithExtendedMessages): 'unknown' | 'not_entitled' | 'error' | 'pending_activation' | 'activated' {
    // for Hybrid Call, we need to aggregate the status from Aware and Connect
    let mostSignificantStatus = status;
    if (status) {
      if (_.includes(this.callServicesinOrgerviceIds, status.serviceId)) {
        const callServicesinOrgtatuses: IServiceSetupStatus[] = this.getCallServicesinOrg();
        mostSignificantStatus = this.getMostSignificantStatus(callServicesinOrgtatuses).status;
      }
    }
    return this.USSService.decorateWithStatus(mostSignificantStatus);
  }

  private getCallServicesinOrg(): IServiceSetupStatus[] {
    return _.compact(_.map(this.allServicesinOrg, (service: IServiceSetupStatus) => {
      if (_.includes(this.callServicesinOrgerviceIds, service.id)) {
        return service;
      }
    })) as IServiceSetupStatus[];
  }

  private getMostSignificantStatus(statuses: IServiceSetupStatus[]): IServiceSetupStatus {
    return _.maxBy(statuses, (status: IServiceSetupStatus) => {
      if (status && status.status) {
        return this.USSService.getStatusSeverity(this.USSService.decorateWithStatus(status.status));
      }
    });
  }

  private getService(id: HybridServiceId): IServiceSetupStatus {
    return _.find(this.allServicesinOrg, (extension) => {
      return extension.id === id;
    });
  }

  public orgHasOneOrMoreServicesEnabled(): boolean {
    return _.some(this.allServicesinOrg, (service) => service.enabled);
  }

  public userUpdatedCallback = (options) => {
    if (!_.isUndefined(options.callServiceAware)) {
      if (!options.callServiceAware) {
        _.remove(this.user.entitlements, (e) => e === 'squared-fusion-uc');
      } else {
        if (!_.some(this.user.entitlements, (e) => e === 'squared-fusion-uc')) {
          this.user.entitlements.push('squared-fusion-uc');
        }
      }
    }
    if (!_.isUndefined(options.callServiceConnect)) {
      if (!options.callServiceConnect) {
        _.remove(this.user.entitlements, (e) => e === 'squared-fusion-ec');
      } else {
        if (!_.some(this.user.entitlements, (e) => e === 'squared-fusion-ec')) {
          this.user.entitlements.push('squared-fusion-ec');
        }
      }
    }
    if (!_.isUndefined(options.hybridMessaging)) {
      if (!options.hybridMessaging) {
        _.remove(this.user.entitlements, (e) => e === 'spark-hybrid-impinterop');
      } else {
        if (!_.some(this.user.entitlements, (e) => e === 'spark-hybrid-impinterop')) {
          this.user.entitlements.push('spark-hybrid-impinterop');
        }
      }
    }
    if (options.refresh) {
      this.init();
    }
  }

}

export class HybridServicesUserSidepanelSectionComponent implements ng.IComponentOptions {
  public controller = HybridServicesUserSidepanelSectionComponentCtrl;
  public template = require('modules/hercules/user-sidepanel/hybrid-services-user-sidepanel-section/hybrid-services-user-sidepanel-section.component.html');
  public bindings = {
    user: '<',
  };
}
