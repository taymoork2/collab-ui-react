import { IFeature } from '../../../core/components/featureList/featureList.component';
import { IActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';

class PlaceOverview implements ng.IComponentController {

  public services: IFeature[] = [];
  public actionList: IActionItem[] = [];
  public deviceList: Object = {};
  public showPstn: boolean = false;

  private currentPlace;
  private csdmHuronUserDeviceService;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private CsdmPlaceService,
    private CsdmHuronPlaceService,
    private CsdmHuronUserDeviceService,
    private Authinfo,
    private XhrNotificationService,
    private CsdmCodeService,
    private WizardFactory
  ) {
    this.currentPlace = this.$stateParams.currentPlace;
    this.csdmHuronUserDeviceService = this.CsdmHuronUserDeviceService.create(this.currentPlace.cisUuid);
  }

  public $onInit(): void {
    this.initDeviceList();
    this.initServices();
    this.initActions();
  }

  private initServices(): void {
    let service: IFeature;
    if (this.hasEntitlement('ciscouc')) {
      service = {
        name: this.$translate.instant('onboardModal.call'),
        icon: 'icon-circle-call',
        state: 'communication',
        detail: this.$translate.instant('onboardModal.paidComm'),
        actionAvailable: true,
      };
    } else {
      service = {
        name: this.$translate.instant('onboardModal.call'),
        icon: 'icon-circle-call',
        state: 'communication',
        detail: this.$translate.instant('common.off'),
        actionAvailable: false,
      };
    }
    this.services.push(service);
  }

  private initActions(): void {
    if (this.currentPlace.type === 'cloudberry') {
      let overview = this;
      this.CsdmPlaceService.pstnFeatureIsEnabled().then(function (result) {
        overview.showPstn = result;
        if (result) {
          overview.actionList = [{
            actionKey: 'usersPreview.editServices',
            actionFunction: () => {
              overview.editCloudberryServices();
            },
          }];
        }
      });
    }
  }

  private initDeviceList(): void {
    this.deviceList = this.currentPlace.devices;
  }

  public editCloudberryServices(): void {
    let wizardState = {
      data: {
        function: 'editServices',
        accountType: 'shared',
        showPlaces: true,
        selectedPlace: this.currentPlace,
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
      return this.CsdmPlaceService
        .updatePlaceName(this.currentPlace.url, newName)
        .catch(this.XhrNotificationService.notify);
    }
    return this.CsdmHuronPlaceService
      .updatePlaceName(this.currentPlace.url, newName)
      .catch(this.XhrNotificationService.notify);
  }

  public showDeviceDetails(device): void {
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
        email:  this.Authinfo.getPrimaryEmail(),
        displayName:  this.Authinfo.displayName,
        organizationId:  this.Authinfo.getOrgId(),
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
      .then( (code) => {
        this.success(code);
      }, (err) => {
        this.error(err);
      });
    } else {
      this.CsdmHuronPlaceService.createOtp(this.currentPlace.cisUuid)
      .then( (code) => {
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
