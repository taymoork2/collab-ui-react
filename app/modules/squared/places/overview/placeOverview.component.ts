import { IFeature } from '../../../core/components/featureList/featureList.component';

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
  private currentPlace: IPlace = <IPlace>{ devices: [] };
  private csdmHuronUserDeviceService;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private CsdmHuronPlaceService,
    private CsdmHuronUserDeviceService,
    private CsdmDataModelService,
    private Authinfo,
    private XhrNotificationService,
    private CsdmCodeService,
    private WizardFactory
  ) {
    this.currentPlace = this.$stateParams.currentPlace;
    this.csdmHuronUserDeviceService = this.CsdmHuronUserDeviceService.create(this.currentPlace.cisUuid);
    CsdmDataModelService.reloadItem(this.currentPlace).then( (updatedPlace) => {
      this.currentPlace = updatedPlace || this.currentPlace;
      this.loadServices();
    });
  }

  public $onInit(): void {
    this.loadServices();
  }

  private loadServices(): void {

    if (this.hasEntitlement('ciscouc')) {
      if (!_.some(this.services, { state: 'communication' })) {
        let service: IFeature = {
          name: this.$translate.instant('onboardModal.call'),
          icon: 'icon-circle-call',
          state: 'communication',
          detail: this.$translate.instant('onboardModal.paidComm'),
          actionAvailable: true,
        };
        this.services.push(service);
      }
    }
  }

  public getDeviceList(): Array<IDevice> {
    return this.currentPlace.devices;
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
