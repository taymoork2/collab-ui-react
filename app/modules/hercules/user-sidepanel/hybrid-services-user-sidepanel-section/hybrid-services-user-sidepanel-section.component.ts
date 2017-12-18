import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IServiceDescription, ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { IUserStatusWithExtendedMessages, USSService } from 'modules/hercules/services/uss.service';
import { Notification } from 'modules/core/notifications';
import { HybridServiceUserSidepanelHelperService } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';

interface IServiceSetupStatus {
  id: HybridServiceId;
  status?: IUserStatusWithExtendedMessages;
}

class HybridServicesUserSidepanelSectionComponentCtrl implements ng.IComponentController {

  private userId: string;
  private userEntitlements: string[];
  private userLicenseIDs: string[];

  private readonly allHybridServiceIds: HybridServiceId[] = ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec', 'spark-hybrid-impinterop'];

  public isInvitePending: boolean;
  public isLicensed: boolean;
  public atlasHybridImpFeatureToggle: boolean;

  private servicesOrgIsEntitledTo: HybridServiceId[];
  private servicesUserCanBeEnabledFor: HybridServiceId[] = [];
  public servicesWithStatuses: IServiceSetupStatus[] = [];

  public couldNotReadStatusesFromFMS: boolean;
  public couldNotReadOffice365Status: boolean;
  public couldNotReadGoogleCalendarStatus: boolean;
  public userIsEnabledForHuron: boolean;
  public bothCalendarTypesWarning: boolean;

  public loadingPage = false;
  private userSubscriptionTimer: ng.IPromise<void>;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private HybridServiceUserSidepanelHelperService: HybridServiceUserSidepanelHelperService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    private Userservice,
    private USSService: USSService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { user } = changes;
    if (user && user.currentValue) {
      this.userId = user.currentValue.id;
      this.userEntitlements = user.currentValue.entitlements;
      this.userLicenseIDs = user.currentValue.licenseID;
      this.isInvitePending = this.Userservice.isInvitePending(user.currentValue);
    }
    this.isLicensed = this.userIsLicensed();
    this.init();
  }

  public $onInit() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp)
      .then((supported) => {
        this.atlasHybridImpFeatureToggle = supported;
      });
  }

  public $onDestroy() {
    if (!_.isUndefined(this.userSubscriptionTimer)) {
      this.$timeout.cancel(this.userSubscriptionTimer);
    }
  }

  private init() {
    this.loadingPage = true;
    this.findServicesOrgIsEntitledTo();

    const promises: ng.IPromise<any>[] = [
      this.findServicesEnabledInFMS(),
      this.findServicesEnabledInCCC(),
    ];

    this.HybridServicesUtilsService.allSettled(promises)
      .then(() => {
        this.loadingPage = true;

        // Some serviceIds could have been enabled both places. Kill duplicates now, and starting building up data structures for the template.
        this.servicesUserCanBeEnabledFor = _.uniq(this.servicesUserCanBeEnabledFor);
        this.servicesWithStatuses = _.map(this.servicesUserCanBeEnabledFor, (serviceId) => {
          return {
            id: serviceId,
          };
        });
      })
      .then(this.getStatusesInUSS)
      .then(this.checkInvalidCombinations)
      .then(this.subscribeToUserStatusUpdates)
      .finally(() => {
        this.loadingPage = false;
      });

  }

  private userIsLicensed(): boolean {
    return !(_.size(this.Authinfo.getLicenses()) > 0 && !this.hasCaaSLicense());
  }

  private hasCaaSLicense(): boolean {
    const licenseIDs: string[] = this.userLicenseIDs || [];
    const offerCodes: string[] = _.map(licenseIDs, (licenseString) => {
      return licenseString.split('_')[0];
    });
    return offerCodes.length > 0;
  }


  public serviceIsOnForUser(serviceId: HybridServiceId): boolean {
    return _.some(this.servicesWithStatuses, (serviceWithStatus) => {
      return serviceId === serviceWithStatus.id && _.get(serviceWithStatus, 'status.entitled');
    });
  }

  public showService = (serviceId: HybridServiceId): boolean => _.includes(this.servicesUserCanBeEnabledFor, serviceId);

  public orgHasOneOrMoreServicesEnabled = (): boolean => this.servicesUserCanBeEnabledFor.length > 0;

  private userHasEntitlement = (entitlement: HybridServiceId | 'ciscouc'): boolean => this.userEntitlements && this.userEntitlements.indexOf(entitlement) > -1;

  public serviceIcon = (serviceId: HybridServiceId): string => this.HybridServicesUtilsService.serviceId2Icon(serviceId);

  private subscribeToUserStatusUpdates = (): ng.IPromise<void> => {
    this.loadingPage = false;
    return this.userSubscriptionTimer = this.$timeout(() => {
      this.init();
    }, 10000);
  }

  public getStatus(serviceId: HybridServiceId): 'unknown' | 'not_entitled' | 'error' | 'pending_activation' | 'activated' {

    let serviceWithStatus: IServiceSetupStatus = _.find(this.servicesWithStatuses, (serviceWithStatus) => {
      return serviceWithStatus.id === serviceId;
    });

    // for Hybrid Call, we need to aggregate the status from Aware and Connect
    if (serviceWithStatus && serviceId === 'squared-fusion-uc') {
      const connectStatus = _.find(this.servicesWithStatuses, (serviceWithStatus) => serviceWithStatus.id === 'squared-fusion-ec');
      serviceWithStatus = this.getMostSignificantStatus([serviceWithStatus, connectStatus]);
    }
    return this.USSService.decorateWithStatus(serviceWithStatus.status);
  }

  private getMostSignificantStatus(statuses: IServiceSetupStatus[]): IServiceSetupStatus {
    return _.maxBy(statuses, (status: IServiceSetupStatus) => {
      if (status && status.status) {
        return this.USSService.getStatusSeverity(this.USSService.decorateWithStatus(status.status));
      }
    });
  }

  private findServicesOrgIsEntitledTo(): void {
    this.servicesOrgIsEntitledTo = _.filter(this.allHybridServiceIds, (service) => this.Authinfo.isEntitled(service));
  }

  private findServicesEnabledInFMS(): ng.IPromise<void> {
    return this.ServiceDescriptorService.getServices()
      .then((servicesInFMS: IServiceDescription[]) => {
        const enabledServices = this.ServiceDescriptorService.filterEnabledServices(servicesInFMS);
        _.forEach(this.servicesOrgIsEntitledTo, (service) => {
          if (_.some(enabledServices, (s) => s.id === service)) {
            this.servicesUserCanBeEnabledFor.push(service);
          }
        });
      })
      .catch(() => {
        this.couldNotReadStatusesFromFMS = true;
      });
  }

  private findServicesEnabledInCCC(): ng.IPromise<void> {
    const promises: ng.IPromise<any>[] = [
      this.CloudConnectorService.getService('squared-fusion-o365'),
      this.CloudConnectorService.getService('squared-fusion-gcal'),
    ];
    return this.HybridServicesUtilsService.allSettled(promises)
      .then((response) => {
        if (_.get(response[0], 'status') === 'fulfilled' && _.get(response[0], 'value.provisioned')) {
          this.servicesUserCanBeEnabledFor.push('squared-fusion-cal');
        }
        if (_.get(response[1], 'status') === 'fulfilled' && _.get(response[1], 'value.provisioned')) {
          this.servicesUserCanBeEnabledFor.push('squared-fusion-gcal');
        }
        if (_.get(response[0], 'status') === 'rejected') {
          this.couldNotReadOffice365Status = true;
        }
        if (_.get(response[1], 'status') === 'rejected') {
          this.couldNotReadGoogleCalendarStatus = true;
        }
      });
  }

  private getStatusesInUSS = (): ng.IPromise<void> => {
    return this.USSService.getStatusesForUser(this.userId)
      .then((userStatuses: IUserStatusWithExtendedMessages[]) => {
        _.forEach(this.servicesWithStatuses, (service: IServiceSetupStatus) => {
          service.status = _.find(userStatuses, (status) => {
            return service.id === status.serviceId;
          });
        });
      })
      .catch((error) => {
        if (this.HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSSPartnerAdmin',
            allowHtml: true,
          });
        } else {
          this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSS');
        }
      });
  }

  private checkInvalidCombinations = (): void => {
    // Calling will not work if a user is enabled for Huron and Hybrid Call at the same time. Just disable the Hybrid Call section.
    if (this.userHasEntitlement('ciscouc') && _.includes(this.servicesUserCanBeEnabledFor, 'squared-fusion-uc')) {
      this.userIsEnabledForHuron = true;
    }

    // Being entitled to both hybrid calendar types will give very strange results. We must warn.
    if (this.userHasEntitlement('squared-fusion-cal') && this.userHasEntitlement('squared-fusion-gcal') &&
      _.includes(this.servicesUserCanBeEnabledFor, 'squared-fusion-cal') && _.includes(this.servicesUserCanBeEnabledFor, 'squared-fusion-gcal')) {
      this.bothCalendarTypesWarning = true;
    }
  }

  public userUpdatedCallback = (options) => {
    if (!_.isUndefined(options.callServiceAware)) {
      if (!options.callServiceAware) {
        _.pull(this.userEntitlements, 'squared-fusion-uc');
      } else {
        if (!_.includes(this.userEntitlements, 'squared-fusion-uc')) {
          this.userEntitlements.push('squared-fusion-uc');
        }
      }
    }
    if (!_.isUndefined(options.callServiceConnect)) {
      if (!options.callServiceConnect) {
        _.pull(this.userEntitlements, 'squared-fusion-ec');
      } else {
        if (!_.includes(this.userEntitlements, 'squared-fusion-ec')) {
          this.userEntitlements.push('squared-fusion-ec');
        }
      }
    }
    if (!_.isUndefined(options.hybridMessaging)) {
      if (!options.hybridMessaging) {
        _.pull(this.userEntitlements, 'spark-hybrid-impinterop');
      } else {
        if (!_.includes(this.userEntitlements, 'spark-hybrid-impinterop')) {
          this.userEntitlements.push('spark-hybrid-impinterop');
        }
      }
    }
    if (!_.isUndefined(options.calendarServiceEntitled)) {
      if (!options.calendarServiceEntitled) {
        _.pull(this.userEntitlements, 'squared-fusion-cal');
        _.pull(this.userEntitlements, 'squared-fusion-gcal');
      } else {
        if (options.calendarType === 'squared-fusion-cal' && !_.includes(this.userEntitlements, 'squared-fusion-cal')) {
          this.userEntitlements.push('squared-fusion-cal');
        }
        if (options.calendarType === 'squared-fusion-gcal' && !_.includes(this.userEntitlements, 'squared-fusion-gcal')) {
          this.userEntitlements.push('squared-fusion-gcal');
        }
      }
    }
    if (options.refresh) {
      if (!_.isUndefined(this.userSubscriptionTimer)) {
        this.$timeout.cancel(this.userSubscriptionTimer);
      }
      this.init();
    }
  }

  public drillDown(serviceId: HybridServiceId) {
    if (this.userIsEnabledForHuron && serviceId === 'squared-fusion-uc') {
      return;
    }
    this.$state.go(`user-overview.hybrid-services-${serviceId}`, {
      userUpdatedCallback: this.userUpdatedCallback,
      isInvitePending: this.isInvitePending,
    });
  }

}

export class HybridServicesUserSidepanelSectionComponent implements ng.IComponentOptions {
  public controller = HybridServicesUserSidepanelSectionComponentCtrl;
  public template = require('./hybrid-services-user-sidepanel-section.component.html');
  public bindings = {
    user: '<',
  };
}
