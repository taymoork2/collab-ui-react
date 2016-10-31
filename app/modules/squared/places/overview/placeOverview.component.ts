import { IFeature } from '../../../core/components/featureList/featureList.component';
import { IActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';

interface IDevice {
}

interface IPlace {
  devices: Array<IDevice>;
  cisUuid?: string;
  type?: string;
  url?: string;
  entitlements?: Array<any>;
  displayName?: string;
}

class PlaceOverview implements ng.IComponentController {

  public services: IFeature[] = [];
  public actionList: IActionItem[] = [];
  public showPstn: boolean = false;

  private currentPlace: IPlace = <IPlace>{ devices: [] };
  private csdmHuronUserDeviceService;

  /* @ngInject */
  constructor(private $q,
              private $state: ng.ui.IStateService,
              private $stateParams,
              private $translate: ng.translate.ITranslateService,
              private $window,
              private Authinfo,
              private CsdmCodeService,
              private CsdmHuronPlaceService,
              private CsdmHuronUserDeviceService,
              private CsdmDataModelService,
              private FeatureToggleService,
              private XhrNotificationService,
              private WizardFactory) {
    this.currentPlace = this.$stateParams.currentPlace;
    this.csdmHuronUserDeviceService = this.CsdmHuronUserDeviceService.create(this.currentPlace.cisUuid);
    CsdmDataModelService.reloadItem(this.currentPlace).then((updatedPlace) => {
      this.currentPlace = updatedPlace || this.currentPlace;
      this.loadServices();
      this.loadActions();
    });
  }

  public $onInit(): void {
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

  private pstnFeatureIsEnabled(): Promise<boolean> {
    if (this.$window.location.search.indexOf('enablePstn=true') > -1) {
      return this.$q.when(true);
    } else {
      return this.FeatureToggleService.supports(this.FeatureToggleService.features.csdmPstn);
    }
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
        accountType: 'shared',
        showPlaces: true,
        selectedPlace: this.currentPlace,
        deviceName: this.currentPlace.displayName,
        entitlements: this.currentPlace.entitlements,
        deviceType: this.currentPlace.type,
        title: 'usersPreview.editServices',
      },
      history: [],
      currentStateName: 'addDeviceFlow.editServices',
      wizardState: {
        'addDeviceFlow.editServices': {
          next: 'addDeviceFlow.addLines',
        },
        'addDeviceFlow.addLines': {},
      },
    };
    let wizard = this.WizardFactory.create(wizardState);
    this.$state.go(wizardState.currentStateName, {
      wizard: wizard,
    });
  }

  public save(newName: string) {
    if (this.currentPlace.type === 'cloudberry') {
      return this.CsdmDataModelService
        .updateItemName(this.currentPlace, newName)
        .catch(this.XhrNotificationService.notify);
    }
    return this.CsdmHuronPlaceService
      .updatePlaceName(this.currentPlace.url, newName)
      .catch(this.XhrNotificationService.notify);
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

  private success(code): void {
    let wizardState = {
      data: {
        function: 'showCode',
        accountType: 'shared',
        showPlaces: true,
        code: code,
        deviceType: this.currentPlace.type,
        deviceName: this.currentPlace.displayName,
        cisUuid: this.Authinfo.getUserId(),
        email: this.Authinfo.getPrimaryEmail(),
        displayName: this.Authinfo.displayName,
        organizationId: this.Authinfo.getOrgId(),
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

  private error(err): void {
    this.XhrNotificationService.notify(err);
  }

  public onGenerateOtpFn(): void {
    if (this.currentPlace.type === 'cloudberry') {
      this.CsdmCodeService.createCodeForExisting(this.currentPlace.cisUuid)
        .then((code) => {
          this.success(code);
        }, (err) => {
          this.error(err);
        });
    } else {
      this.CsdmHuronPlaceService.createOtp(this.currentPlace.cisUuid)
        .then((code) => {
          this.success(code);
        }, (err) => {
          this.error(err);
        });
    }
  }
}

export class PlaceOverviewComponent implements ng.IComponentOptions {
  public controller = PlaceOverview;
  public templateUrl = 'modules/squared/places/overview/placeOverview.html';
}
