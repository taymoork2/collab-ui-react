import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { IActionItem } from 'modules/core/shared/section-title/section-title.component';
import { Line, LineConsumerType, LineService, LINE_CHANGE } from 'modules/huron/lines/services';
import { IPrimaryLineFeature, PrimaryLineService, PrimaryNumber } from 'modules/huron/primaryLine';
import { PlaceCallOverviewData, PlaceCallOverviewService } from './placeCallOverview.service';
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
  // Data from services
  public placeCallOverviewData: PlaceCallOverviewData;
  public displayDescription: string;
  public wide: boolean = true;
  public isprov3698: boolean = false;
  public primaryLineEnabled: boolean;
  public userPrimaryNumber: PrimaryNumber;
  public isPrimaryLineFeatureEnabled: boolean = true;
  public primaryLineFeature: IPrimaryLineFeature;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    CsdmDataModelService: any,
    private LineService: LineService,
    private PlaceCallOverviewService: PlaceCallOverviewService,
    private PrimaryLineService: PrimaryLineService,
    private $q: ng.IQService,
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
      this.initNumbers();
      this.initServices();
    }
  }

  private displayPlace(newPlace) {
    this.currentPlace = newPlace;
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

  private initServices(): void {
    const promises  = {
      1: this.LineService.getLineList(LineConsumerType.PLACES, this.currentPlace.cisUuid, this.wide),
      2: this.PlaceCallOverviewService.getCmiPlaceInfo(this.currentPlace.cisUuid),
    };
    this.$q.all(promises).then( data => {
      this.directoryNumbers = data[1];
      this.userPrimaryNumber = _.get(data[2], 'primaryNumber');
      this.checkPrimaryLineFeature(this.userPrimaryNumber);
    }).then (() => {
      this.initFeatures();
    });
  }

  private initFeatures(): void {
    this.features = [];
    if (this.currentPlace.type === 'huron') {
      const phoneButtonLayoutService: IFeature = {
        name: this.$translate.instant('telephonyPreview.phoneButtonLayout'),
        state: 'phoneButtonLayout',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(phoneButtonLayoutService);

      const cosService: IFeature = {
        name: this.$translate.instant('serviceSetupModal.cos.title'),
        state: 'cos',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(cosService);

      const transferService: IFeature = {
        name: this.$translate.instant('telephonyPreview.externalTransfer'),
        state: 'externaltransfer',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(transferService);
    }

    if (this.currentPlace.type === 'huron' && this.isPrimaryLineFeatureEnabled) {
      const primaryLineService: IFeature = {
        name: this.$translate.instant('primaryLine.title'),
        state: 'primaryLine',
        detail: this.primaryLineEnabled ? this.$translate.instant('primaryLine.primaryLineLabel')
                                        : this.$translate.instant('primaryLine.autoLabel'),
        actionAvailable: true,
      };
      this.features.push(primaryLineService);
    }
  }

  private initNumbers(): void {
    this.LineService.getLineList(LineConsumerType.PLACES, this.currentPlace.cisUuid, this.wide)
      .then(lines => this.directoryNumbers = lines);
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
    const lineSelection = {
      primaryLineEnabled: this.primaryLineEnabled,
      module: 'place',
    };
    this.$state.go('place-overview.communication.' + feature.state, {
      currentPlace: this.currentPlace,
      lineSelection: lineSelection,
    });
  }

  private checkPrimaryLineFeature(userPrimaryNumber: PrimaryNumber): void {
    if (!_.isEmpty(userPrimaryNumber)) {
      this.primaryLineEnabled = userPrimaryNumber.alwaysUseForOutboundCalls;
    }
    if (!this.PrimaryLineService.checkIfMultiLineExists(this.directoryNumbers)) {
      this.isPrimaryLineFeatureEnabled = false;
    }
  }
}

export class PlaceCallOverviewComponent implements ng.IComponentOptions {
  public controller = PlaceCallOverview;
  public template = require('modules/squared/places/callOverview/placeCallOverview.html');
}
