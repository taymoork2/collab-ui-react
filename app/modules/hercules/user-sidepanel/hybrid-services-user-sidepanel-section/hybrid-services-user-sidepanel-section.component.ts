import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IServiceDescription, ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { IUserStatusWithExtendedMessages, USSService } from 'modules/hercules/services/uss.service';
import { Notification } from 'modules/core/notifications';
import { HybridServiceUserSidepanelHelperService } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { IUserData, UserOverviewService } from 'modules/core/users/userOverview/userOverview.service';

interface IServiceSetupStatus {
  id: HybridServiceId;
  status?: IUserStatusWithExtendedMessages;
}

class HybridServicesUserSidepanelSectionComponentCtrl implements ng.IComponentController {

  private userId: string;
  private userEntitlements: string[];

  private readonly allHybridServiceIds: HybridServiceId[] = ['squared-fusion-cal', 'squared-fusion-gcal', 'squared-fusion-uc', 'squared-fusion-ec', 'spark-hybrid-impinterop'];

  public isInvitePending: boolean;
  public atlasHybridImpFeatureToggle: boolean;
  private userLicenseIDs: string[];
  public isLicensed: boolean;

  private servicesOrgIsEntitledTo: HybridServiceId[];
  private servicesEnabledInOrganization: HybridServiceId[] = [];
  private enabledServicesWithStatuses: IServiceSetupStatus[] = [];

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
    private UserOverviewService: UserOverviewService,
    private USSService: USSService,
  ) { }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { user } = changes;
    if (user && user.currentValue) {
      this.userId = user.currentValue.id;
      this.userLicenseIDs = user.currentValue.licenseID;
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
        this.servicesEnabledInOrganization = _.uniq(this.servicesEnabledInOrganization);
        this.enabledServicesWithStatuses = _.map(this.servicesEnabledInOrganization, (serviceId) => {
          return {
            id: serviceId,
          };
        });
      })
      .then(this.getUserFromCommonIdentity)
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
    return _.map(this.userLicenseIDs || [], (licenseString) => licenseString.split('_')[0]).length > 0;
  }

  public userIsEnabledInUSS(serviceId: HybridServiceId): boolean {
    return _.some(this.enabledServicesWithStatuses, (serviceWithStatus) => {
      return serviceId === serviceWithStatus.id && _.get(serviceWithStatus, 'status.entitled');
    });
  }

  private userHasEntitlement = (entitlement: HybridServiceId | 'ciscouc'): boolean => this.userEntitlements && this.userEntitlements.indexOf(entitlement) > -1;

  public serviceIcon = (serviceId: HybridServiceId): string => this.HybridServicesUtilsService.serviceId2Icon(serviceId);

  private subscribeToUserStatusUpdates = (): ng.IPromise<void> => {
    this.loadingPage = false;
    return this.userSubscriptionTimer = this.$timeout(() => {
      this.init();
    }, 10000);
  }

  public getStatus(serviceId: HybridServiceId): 'unknown' | 'not_entitled' | 'error' | 'pending_activation' | 'activated' {

    let serviceWithStatus: IServiceSetupStatus = _.find(this.enabledServicesWithStatuses, (serviceWithStatus) => {
      return serviceWithStatus.id === serviceId;
    });

    // for Hybrid Call, we need to aggregate the status from Aware and Connect
    if (serviceWithStatus && serviceId === 'squared-fusion-uc') {
      const connectStatus = _.find(this.enabledServicesWithStatuses, (serviceWithStatus) => serviceWithStatus.id === 'squared-fusion-ec');
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
            this.servicesEnabledInOrganization.push(service);
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
          this.servicesEnabledInOrganization.push('squared-fusion-cal');
        }
        if (_.get(response[1], 'status') === 'fulfilled' && _.get(response[1], 'value.provisioned')) {
          this.servicesEnabledInOrganization.push('squared-fusion-gcal');
        }
        if (_.get(response[0], 'status') === 'rejected') {
          this.couldNotReadOffice365Status = true;
        }
        if (_.get(response[1], 'status') === 'rejected') {
          this.couldNotReadGoogleCalendarStatus = true;
        }
      });
  }


  private getUserFromCommonIdentity = (): ng.IPromise<void> => {
    return this.UserOverviewService.getUser(this.userId)
      .then((commonIdentityUserData: IUserData) => {
        this.userEntitlements = commonIdentityUserData.user.entitlements;
        this.isInvitePending = commonIdentityUserData.user.pendingStatus;
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromCI');
      });
  }

  private getStatusesInUSS = (): ng.IPromise<void> => {
    return this.USSService.getStatusesForUser(this.userId)
      .then((userStatuses: IUserStatusWithExtendedMessages[]) => {
        _.forEach(this.enabledServicesWithStatuses, (service: IServiceSetupStatus) => {
          service.status = _.find(userStatuses, (status) => {
            return service.id === status.serviceId;
          });
        });
      })
      .catch((error) => {
        if (this.HybridServiceUserSidepanelHelperService.isPartnerAdminAndGot403Forbidden(error)) {
          this.Notification.errorWithTrackingId(error, {
            errorKey: 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSSPartnerAdmin',
            feedbackInstructions: true,
          });
        } else {
          this.Notification.errorWithTrackingId(error, 'hercules.userSidepanel.errorMessages.cannotReadUserDataFromUSS');
        }
      });
  }

  private checkInvalidCombinations = (): void => {
    // Calling will not work if a user is enabled for Huron and Hybrid Call at the same time. Just disable the Hybrid Call section.
    if (this.userHasEntitlement('ciscouc') && _.includes(this.servicesEnabledInOrganization, 'squared-fusion-uc')) {
      this.userIsEnabledForHuron = true;
    }

    // Being entitled to both hybrid calendar types will give very strange results. We must warn.
    if (this.userHasEntitlement('squared-fusion-cal') && this.userHasEntitlement('squared-fusion-gcal') &&
      _.includes(this.servicesEnabledInOrganization, 'squared-fusion-cal') && _.includes(this.servicesEnabledInOrganization, 'squared-fusion-gcal')) {
      this.bothCalendarTypesWarning = true;
    }
  }

  public drillDown(serviceId: HybridServiceId) {
    if (this.userIsEnabledForHuron && serviceId === 'squared-fusion-uc') {
      return;
    }
    this.$state.go(`user-overview.hybrid-services-${serviceId}`);
  }

}

export class HybridServicesUserSidepanelSectionComponent implements ng.IComponentOptions {
  public controller = HybridServicesUserSidepanelSectionComponentCtrl;
  public template = require('./hybrid-services-user-sidepanel-section.component.html');
  public bindings = {
    user: '<',
  };
}
