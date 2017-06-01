import { LineService, LineConsumerType, Line, LINE_CHANGE } from 'modules/huron/lines/services';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { Notification } from 'modules/core/notifications';
import { PlaceCallOverviewService, PlaceCallOverviewData } from './placeCallOverview.service';

class PlaceCallOverview implements ng.IComponentController {

  public currentPlace;
  public hasSparkCall: boolean;
  public actionList: IActionItem[];
  public features: IFeature[];

  public directoryNumbers: Line[];
  public preferredLanguageOptions: any[];
  public preferredLanguage: any;
  public plIsLoaded: boolean = false;
  public prefLanguageSaveInProcess: boolean = false;
  public onPrefLanguageChange: boolean = false;
  private externalTransferFeatureToggle;
  // Data from services
  public placeCallOverviewData: PlaceCallOverviewData;
  public displayDescription: string;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    CsdmDataModelService: any,
    private LineService: LineService,
    private Notification: Notification,
    private PlaceCallOverviewService: PlaceCallOverviewService,
    private FeatureToggleService,
  ) {

    this.displayPlace($stateParams.currentPlace);

    CsdmDataModelService.reloadItem($stateParams.currentPlace)
      .then((updatedPlace) => this.displayPlace(updatedPlace));

    this.hasSparkCall = this.hasEntitlement('ciscouc');
    this.$scope.$on(LINE_CHANGE, () => {
      this.initNumbers();
    });
  }

  public $onInit(): void {
    if (this.hasSparkCall) {
      this.initActions();
      this.initFeatures();
      this.initNumbers();
      this.initPlaceCallOverviewData();
    }
    this.setDisplayDescription();
  }

  private displayPlace(newPlace) {
    this.currentPlace = newPlace;
  }

  private setDisplayDescription() {
    this.displayDescription = this.hasSparkCall ?
        this.$translate.instant('preferredLanguage.description', {
          module: this.$translate.instant('preferredLanguage.placeModule'),
        }) :
        this.$translate.instant('preferredLanguage.descriptionForCloudberryDevice');
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

  private initFeatures(): void {
    this.features = [];
    if (this.currentPlace.type === 'huron') {
      let service: IFeature = {
        name: this.$translate.instant('telephonyPreview.speedDials'),
        state: 'speedDials',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(service);

      let cosService: IFeature = {
        name: this.$translate.instant('serviceSetupModal.cos.title'),
        state: 'cos',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(cosService);
    }

    this.FeatureToggleService.supports(this.FeatureToggleService.features.hi1033).then((enabled) => {
      this.externalTransferFeatureToggle = enabled;
      if (this.currentPlace.type === 'huron' && this.externalTransferFeatureToggle) {
        let transferService: IFeature = {
          name: this.$translate.instant('telephonyPreview.externalTransfer'),
          state: 'externaltransfer',
          detail: undefined,
          actionAvailable: true,
        };
        this.features.push(transferService);
      }
    });
  }

  private initNumbers(): void {
    this.LineService.getLineList(LineConsumerType.PLACES, this.currentPlace.cisUuid)
      .then(lines => this.directoryNumbers = lines);
  }

  private initPlaceCallOverviewData(): void {
    this.PlaceCallOverviewService.getPlaceCallOverviewData(this.currentPlace.cisUuid)
        .then( placeCallOverviewData => {
          this.placeCallOverviewData = placeCallOverviewData;
          this.preferredLanguage = placeCallOverviewData.preferredLanguage;
          this.preferredLanguageOptions = placeCallOverviewData.preferredLanguageOptions;
        }).finally(() => {
          this.plIsLoaded = true;
        });
  }

  public setPreferredLanguage(preferredLanguage: any): void {
    this.preferredLanguage = preferredLanguage;
    this.checkForChanges();
  }

  private checkForChanges(): void {
    if (this.PlaceCallOverviewService.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      this.resetPreferredLanguageFlags();
    }
  }

  private resetPreferredLanguageFlags(): void {
    this.prefLanguageSaveInProcess = false;
    this.onPrefLanguageChange = false;
  }

  public savePreferredLanguage(): void {
    this.prefLanguageSaveInProcess = true;
    if (!this.PlaceCallOverviewService.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      let prefLang = this.preferredLanguage.value ? this.preferredLanguage.value : null;
      this.PlaceCallOverviewService.updateCmiPlacePreferredLanguage(this.currentPlace.cisUuid, prefLang)
        .then(() => {
          this.placeCallOverviewData.placesPreferredLanguage = prefLang;
          this.placeCallOverviewData.preferredLanguage = this.preferredLanguage;
          this.Notification.success('preferredLanguage.placesCallOverviewSaveSuccess');
        })
        .catch(error => {
          this.Notification.errorResponse(error, 'preferredLanguage.failedToSaveChanges');
        }).finally(() => {
          this.resetPreferredLanguageFlags();
          this.plIsLoaded = true;
        });
    }
  }

  public onCancelPreferredLanguage(): void {
    if (!this.PlaceCallOverviewService.checkForPreferredLanguageChanges(this.preferredLanguage)) {
      this.preferredLanguage = this.placeCallOverviewData.preferredLanguage;
    }
    this.resetPreferredLanguageFlags();
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

  public clickFeature(feature: IFeature) {
    this.$state.go('place-overview.communication.' + feature.state, {
      currentPlace: this.currentPlace,
    });
    this.onCancelPreferredLanguage();
  }
}

export class PlaceCallOverviewComponent implements ng.IComponentOptions {
  public controller = PlaceCallOverview;
  public templateUrl = 'modules/squared/places/callOverview/placeCallOverview.html';
}
