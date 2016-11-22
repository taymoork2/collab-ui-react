import { IFeature } from '../../../core/components/featureList/featureList.component';
import { IActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';

interface IDevice {
}

interface IPlace {
  devices: {};
  cisUuid?: string;
  type?: string;
  url?: string;
  entitlements?: Array<any>;
  displayName?: string;
  sipUrl?: string;
}

class PlaceOverview implements ng.IComponentController {

  public services: IFeature[] = [];
  public actionList: IActionItem[] = [];
  public showPstn: boolean = false;
  public showATA: boolean = false;
  public csdmHybridCallFeature: boolean = false;

  private currentPlace: IPlace = <IPlace>{ devices: {} };
  private csdmHuronUserDeviceService;
  private adminDisplayName;

  /* @ngInject */
  constructor(private $q,
              private $state: ng.ui.IStateService,
              private $stateParams,
              private $translate: ng.translate.ITranslateService,
              private $window,
              private Authinfo,
              private CsdmHuronUserDeviceService,
              private CsdmDataModelService,
              private FeatureToggleService,
              private Notification,
              private Userservice,
              private WizardFactory) {
    this.csdmHuronUserDeviceService = this.CsdmHuronUserDeviceService.create(this.currentPlace.cisUuid);
    CsdmDataModelService.reloadItem(this.currentPlace).then((updatedPlace) => this.displayPlace(updatedPlace));
  }

  public $onInit(): void {
    this.displayPlace(this.$stateParams.currentPlace);
    this.fetchDisplayNameForLoggedInUser();
    this.fetchFeatureToggles();
  }

  private displayPlace(newPlace) {
    this.currentPlace = newPlace;
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
    } else {
      service = {
        name: this.$translate.instant('onboardModal.call'),
        icon: 'icon-circle-call',
        state: 'communication',
        detail: this.$translate.instant('placesPage.sparkOnly'),
        actionAvailable: false,
      };
    }
    this.services = [];
    this.services.push(service);
  }

  private fetchDisplayNameForLoggedInUser() {
    this.Userservice.getUser('me', (data) => {
      if (data.success) {
        this.adminDisplayName = data.displayName;
      }
    });
  }

  private pstnFeatureIsEnabled(): Promise<boolean> {
    if (this.$window.location.search.indexOf('enablePstn=true') > -1) {
      return this.$q.when(true);
    } else {
      return this.FeatureToggleService.supports(this.FeatureToggleService.features.csdmPstn);
    }
  }

  private fetchFeatureToggles() {
    this.FeatureToggleService.csdmATAGetStatus().then((result) => {
      this.showATA = result;
    });
    this.FeatureToggleService.csdmHybridCallGetStatus().then((feature) => {
      this.csdmHybridCallFeature = feature;
    });
  }

  private loadActions(): void {
    this.actionList = [];
    if (this.currentPlace.type === 'cloudberry') {
      this.pstnFeatureIsEnabled().then((result) => {
        this.showPstn = result && this.Authinfo.isSquaredUC();
        if (result) {
          this.actionList = [{
            actionKey: 'usersPreview.editServices',
            actionFunction: () => {
              this.editCloudberryServices();
            },
          }];
        }
      });
    }
  }

  public editCloudberryServices(): void {
    let wizardState = {
      data: {
        function: 'editServices',
        title: 'usersPreview.editServices',
        showPlaces: true,
        account: {
          deviceType: this.currentPlace.type,
          type: 'shared',
          name: this.currentPlace.displayName,
          cisUuid: this.currentPlace.cisUuid,
          entitlements: this.currentPlace.entitlements,
        },
      },
      history: [],
      currentStateName: 'addDeviceFlow.editServices',
      wizardState: {
        'addDeviceFlow.editServices': {
          nextOptions: {
            sparkCall: 'addDeviceFlow.addLines',
            sparkCallConnect: 'addDeviceFlow.callConnectOptions',
          },
        },
        'addDeviceFlow.addLines': {},
        'addDeviceFlow.callConnectOptions': {},
      },
    };
    let wizard = this.WizardFactory.create(wizardState);
    this.$state.go(wizardState.currentStateName, {
      wizard: wizard,
    });
  }

  public save(newName: string) {
    return this.CsdmDataModelService
      .updateItemName(this.currentPlace, newName)
      .then((updatedPlace) => this.displayPlace(updatedPlace))
      .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'placesPage.failedToSaveChanges');
        }
      );
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

  public onGenerateOtpFn(): void {
    let wizardState = {
      data: {
        function: 'showCode',
        showPlaces: true,
        showATA: this.showATA,
        csdmHybridCallFeature: this.csdmHybridCallFeature,
        account: {
          type: 'shared',
          deviceType: this.currentPlace.type,
          cisUuid: this.currentPlace.cisUuid,
          name: this.currentPlace.displayName,
        },
        recipient: {
          cisUuid: this.Authinfo.getUserId(),
          email: this.Authinfo.getPrimaryEmail(),
          displayName: this.adminDisplayName,
          organizationId: this.Authinfo.getOrgId(),
        },
        title: 'addDeviceWizard.newCode',
      },
      history: [],
      currentStateName: 'addDeviceFlow.showActivationCode',
      wizardState: {
        'addDeviceFlow.showActivationCode': {},
      },
    };
    let wizard = this.WizardFactory.create(wizardState);
    this.$state.go('addDeviceFlow.showActivationCode', {
      wizard: wizard,
    });
  }
}

export class PlaceOverviewComponent implements ng.IComponentOptions {
  public controller = PlaceOverview;
  public templateUrl = 'modules/squared/places/overview/placeOverview.html';
}
