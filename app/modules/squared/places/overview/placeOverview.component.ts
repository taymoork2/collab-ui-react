import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import IPlace = csdm.IPlace;
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { PlaceCallOverviewService, PlaceCallOverviewData } from 'modules/squared/places/callOverview/placeCallOverview.service';
import { LocationsService, LocationListItem, MEMBER_TYPE_PLACE } from 'modules/call/locations';
import { IPreferredLanguageFeature, PreferredLanguageFeature, IPreferredLanugageOption } from 'modules/huron/preferredLanguage';
import { Notification } from 'modules/core/notifications';
import { CloudConnectorService } from '../../../hercules/services/calendar-cloud-connector.service';

interface IDevice {
}

class PlaceOverview implements ng.IComponentController {

  public services: IFeature[] = [];
  public actionList: IActionItem[] = [];
  public showPstn: boolean = false;
  public showATA: boolean = false;
  public csdmHybridCallFeature: boolean = false;
  private csdmHybridCalendarFeature = false;
  private hybridCalendarEnabledOnOrg = false;
  private hybridCallEnabledOnOrg = false;
  public generateCodeIsDisabled = true;
  public hasSparkCall: boolean;
  public displayDescription: string;

  private currentPlace: IPlace = <IPlace>{ devices: {} };
  private csdmHuronUserDeviceService;
  private adminUserDetails;
  public showDeviceSettings = false;

  public ishI1484: boolean = false;

  public placeLocation: string;
  public locationOptions: LocationListItem[] = [];
  public selectedLocation: LocationListItem;

  public placeCallOverviewData: PlaceCallOverviewData;
  public prefLanguageSaveInProcess: boolean = false;
  public preferredLanguage: IPreferredLanugageOption[];
  public plIsLoaded: boolean = false;

  public preferredLanguageFeature: IPreferredLanguageFeature = new PreferredLanguageFeature();

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CsdmHuronUserDeviceService,
    private CsdmDataModelService: ICsdmDataModelService,
    private FeatureToggleService,
    private ServiceDescriptorService: ServiceDescriptorService,
    private Userservice,
    private WizardFactory,
    public LocationsService: LocationsService,
    private PlaceCallOverviewService: PlaceCallOverviewService,
    private Notification: Notification,
    private CloudConnectorService: CloudConnectorService,
  ) {
    this.csdmHuronUserDeviceService = this.CsdmHuronUserDeviceService.create(this.$stateParams.currentPlace.cisUuid);
    CsdmDataModelService.reloadItem(this.$stateParams.currentPlace).then((updatedPlace) => this.displayPlace(updatedPlace));
    this.displayPlace(this.$stateParams.currentPlace);
    this.hasSparkCall = this.hasEntitlement('ciscouc');
  }

  public $onInit(): void {
    if (this.hasSparkCall) {
      this.initPlaceCallOverviewData();
      this.initActions();
      this.getPlaceLocation();
    }
    this.fetchAsyncSettings();
    this.showDeviceSettings = this.currentPlace.type === 'cloudberry';
    this.setDisplayDescription();
    if (this.showLanguage()) {
      this.initPreferredLanguage();
    }
  }

  public hasHybridEntitlements(): boolean {
    return this.hasEntitlement('squared-fusion-uc') || this.hasEntitlement('squared-fusion-cal') || this.hasEntitlement('squared-fusion-gcal');
  }

  public initPlaceCallOverviewData(): void {
    this.PlaceCallOverviewService.getPlaceCallOverviewData(this.currentPlace.cisUuid)
        .then( placeCallOverviewData => {
          this.placeCallOverviewData = placeCallOverviewData;
          this.preferredLanguage = placeCallOverviewData.preferredLanguage;
          this.preferredLanguageFeature.languageOptions = placeCallOverviewData.preferredLanguageOptions;
          this.preferredLanguageFeature.save = this.savePreferredLanguage.bind(this);
        }).finally(() => {
          this.plIsLoaded = true;
        });
  }

  public initPreferredLanguage() {
    this.preferredLanguageFeature.languageOptions = this.PlaceCallOverviewService.getSiteLanguages();
    this.preferredLanguageFeature.hasSparkCall = this.hasSparkCall;
    this.preferredLanguageFeature.currentUserId = this.currentPlace.cisUuid;
    this.PlaceCallOverviewService.getPlaceCallOverviewData(this.currentPlace.cisUuid)
        .then( placeCallOverviewData => {
          this.preferredLanguageFeature.selectedLanguageCode = placeCallOverviewData.preferredLanguage.value;
        });
    this.PlaceCallOverviewService.getSiteLanguages().then( (langOptions: IPreferredLanugageOption[]) => {
      this.preferredLanguageFeature.languageOptions = langOptions;
    });
  }

  private initActions(): void {
    if (this.currentPlace.type === 'huron') {
      this.actionList = [{
        actionKey: 'usersPreview.addNewLinePreview',
        actionFunction: () => {
          this.$state.go('place-overview.communication.line-overview');
        },
      }];
    }
  }

  //TODO:Change to use appropriate API call when the PLACES Location is available on the API
  public getPlaceLocation(): void {
    this.LocationsService.getUserLocation(this.currentPlace.cisUuid).then(result => {
      this.placeLocation = result.name;
      this.selectedLocation = result;
    });
  }

  public openPanel(): void {
    this.$state.go('place-overview.placeLocationDetails' , { memberType: MEMBER_TYPE_PLACE });
  }

  public openPreferredLanguage(): void {
    this.$state.go('place-overview.preferredLanguage', { preferredLanguageFeature: this.preferredLanguageFeature });
  }

  private setDisplayDescription() {
    this.displayDescription = this.hasSparkCall ?
        this.$translate.instant('preferredLanguage.description', {
          module: this.$translate.instant('preferredLanguage.placeModule'),
        }) :
        this.$translate.instant('preferredLanguage.descriptionForCloudberryDevice');
  }

  public savePreferredLanguage(prefLang): void {
    this.prefLanguageSaveInProcess = true;
    if (!this.PlaceCallOverviewService.checkForPreferredLanguageChanges(prefLang)) {
      this.PlaceCallOverviewService.updateCmiPlacePreferredLanguage(this.currentPlace.cisUuid, prefLang.value ? prefLang.value : null)
        .then(() => {
          this.preferredLanguageFeature.selectedLanguageCode = prefLang.value;
          this.$state.go('place-overview', { preferredLanguageFeature: this.preferredLanguageFeature }, { reload: true });
        })
        .catch(error => {
          this.Notification.errorResponse(error, 'preferredLanguage.failedToSaveChanges');
        });
    }
  }

  private displayPlace(newPlace: IPlace) {
    this.currentPlace = newPlace;
    this.currentPlace.id = this.currentPlace.cisUuid;
    this.loadServices();
    this.loadActions();
  }

  private loadServices(): void {
    let service: IFeature;
    if (this.hasEntitlement('ciscouc')) {
      service = {
        name: this.$translate.instant('onboardModal.call'),
        icon: 'icon-circle-call',
        state: 'communication',
        detail: this.$translate.instant('placesPage.sparkCall'),
        actionAvailable: true,
      };
    } else if (this.hasEntitlement('squared-fusion-uc')) {
      //dont add call services, it will be handled by hybrid-cloudberry-section
      this.services = [];
      return;
    } else {
      service = {
        name: this.$translate.instant('onboardModal.call'),
        icon: 'icon-circle-call',
        state: 'communication',
        detail: this.$translate.instant('placesPage.sparkOnly'),
        actionAvailable: true,
      };
    }
    this.services = [];
    this.services.push(service);
  }

  private fetchAsyncSettings() {
    this.FeatureToggleService.csdmATAGetStatus().then(feature => {
      this.showATA = feature;
    });
    this.FeatureToggleService.csdmHybridCallGetStatus().then(feature => {
      this.csdmHybridCallFeature = feature;
    });
    this.FeatureToggleService.csdmPlaceCalendarGetStatus().then(feature => {
      this.csdmHybridCalendarFeature = feature;
    });
    this.ServiceDescriptorService.getServices().then(services => {
      this.hybridCalendarEnabledOnOrg = this.hybridCalendarEnabledOnOrg || _.chain(this.ServiceDescriptorService.filterEnabledServices(services)).filter(service => {
        return service.id === 'squared-fusion-gcal' || service.id === 'squared-fusion-cal';
      }).some().value();
      this.hybridCallEnabledOnOrg = _.chain(this.ServiceDescriptorService.filterEnabledServices(services)).filter(service => {
        return service.id === 'squared-fusion-uc';
      }).some().value();
    });
    this.FeatureToggleService.atlasOffice365SupportGetStatus().then(feature => {
      if (feature) {
        this.CloudConnectorService.getService('squared-fusion-o365').then(service => {
          this.hybridCalendarEnabledOnOrg = this.hybridCalendarEnabledOnOrg || service.provisioned;
        });
      }
    });
    this.CloudConnectorService.getService('squared-fusion-gcal').then(service => {
      this.hybridCalendarEnabledOnOrg = this.hybridCalendarEnabledOnOrg || service.provisioned;
    });

    this.fetchDetailsForLoggedInUser();

    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
    .then(result => this.ishI1484 = result);
  }

  private fetchDetailsForLoggedInUser() {
    this.Userservice.getUser('me', (data) => {
      if (data.success) {
        this.adminUserDetails = {
          firstName: data.name && data.name.givenName,
          lastName: data.name && data.name.familyName,
          displayName: data.displayName,
          userName: data.userName,
          cisUuid: data.id,
          organizationId: data.meta.organizationID,
        };
      }
    });
  }

  private loadActions(): void {
    this.actionList = [];
    if (this.currentPlace.type === 'cloudberry') {
      this.showPstn = this.Authinfo.isSquaredUC();
      this.actionList = [{
        actionKey: 'common.edit',
        actionFunction: () => {
          this.editCloudberryServices();
        },
      }];
    }
  }

  public getCurrentPlace = (): IPlace => {
    return this.currentPlace;
  }

  private startStateMap = {
    'squared-fusion-uc': 'addDeviceFlow.callConnectOptions',
    'squared-fusion-cal': 'addDeviceFlow.editCalendarService',
    'squared-fusion-gcal': 'addDeviceFlow.editCalendarService',
  };

  public editCloudberryServices = (startAtService?): void => {

    const startState = startAtService && this.startStateMap[startAtService] || 'addDeviceFlow.editServices';
    const wizardState = {
      data: {
        function: 'editServices',
        title: 'usersPreview.editServices',
        csdmHybridCallFeature: this.csdmHybridCallFeature,
        csdmHybridCalendarFeature: this.csdmHybridCalendarFeature,
        hybridCalendarEnabledOnOrg: this.hybridCalendarEnabledOnOrg,
        hybridCallEnabledOnOrg: this.hybridCallEnabledOnOrg,
        account: {
          deviceType: this.currentPlace.type,
          type: 'shared',
          name: this.currentPlace.displayName,
          cisUuid: this.currentPlace.cisUuid,
          entitlements: this.currentPlace.entitlements,
          externalLinkedAccounts: this.currentPlace.externalLinkedAccounts,
        },
      },
      history: [],
      currentStateName: startState,
      wizardState: {
        'addDeviceFlow.editServices': {
          nextOptions: {
            sparkCall: 'addDeviceFlow.addLines',
            sparkCallConnect: 'addDeviceFlow.callConnectOptions',
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.addLines': {
          nextOptions: {
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.callConnectOptions': {
          nextOptions: {
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
        'addDeviceFlow.editCalendarService': {
          nextOptions: {
            calendar: 'addDeviceFlow.editCalendarService',
          },
        },
      },
    };
    const wizard = this.WizardFactory.create(wizardState);
    this.$state.go(wizardState.currentStateName, {
      wizard: wizard,
    });
  }

  public save(newName: string) {
    return this.CsdmDataModelService
      .updateItemName(this.currentPlace, newName)
      .then((updatedPlace) => this.displayPlace(updatedPlace))
      .catch((error) => {
        this.Notification.errorResponse(error, 'placesPage.failedToSaveChanges');
        return this.$q.reject(error);
      });
  }

  public showDeviceDetails(device: IDevice): void {
    this.$state.go('place-overview.csdmDevice', {
      currentDevice: device,
      huronDeviceService: this.csdmHuronUserDeviceService,
    });
  }

  private hasEntitlement(entitlement: string): boolean {
    let hasEntitlement = false;
    if (this.currentPlace.entitlements) {
      this.currentPlace.entitlements.forEach(element => {
        if (element === entitlement) {
          hasEntitlement = true;
        }
      });
    }
    return hasEntitlement;
  }

  public clickService(feature: IFeature): void {
    this.$state.go('place-overview.' + feature.state);
  }

  public anyHybridServiceToggle() {
    return this.csdmHybridCalendarFeature || this.csdmHybridCallFeature;
  }

  public onGenerateOtpFn(): void {
    const wizardState = {
      data: {
        function: 'showCode',
        showATA: this.showATA,
        csdmHybridCallFeature: this.csdmHybridCallFeature,
        csdmHybridCalendarFeature: this.csdmHybridCalendarFeature,
        hybridCalendarEnabledOnOrg: this.hybridCalendarEnabledOnOrg,
        hybridCallEnabledOnOrg: this.hybridCallEnabledOnOrg,
        admin: this.adminUserDetails,
        account: {
          type: 'shared',
          deviceType: this.currentPlace.type,
          cisUuid: this.currentPlace.cisUuid,
          name: this.currentPlace.displayName,
          organizationId: this.Authinfo.getOrgId(),
        },
        recipient: {
          cisUuid: this.Authinfo.getUserId(),
          email: this.Authinfo.getPrimaryEmail(),
          displayName: this.adminUserDetails.displayName,
          organizationId: this.adminUserDetails.organizationId,
        },
        title: 'addDeviceWizard.newCode',
      },
      history: [],
      currentStateName: 'addDeviceFlow.showActivationCode',
      wizardState: {
        'addDeviceFlow.showActivationCode': {},
      },
    };
    const wizard = this.WizardFactory.create(wizardState);
    this.$state.go('addDeviceFlow.showActivationCode', {
      wizard: wizard,
    });
  }

  public showLocations(): boolean {
    return (this.ishI1484 && this.hasSparkCall);
  }

  public showLanguage(): boolean {
    return (this.currentPlace.type === 'huron');
  }
}

export class PlaceOverviewComponent implements ng.IComponentOptions {
  public controller = PlaceOverview;
  public template = require('modules/squared/places/overview/placeOverview.html');
  public bindings = {
    userDetails: '<',
  };
}
