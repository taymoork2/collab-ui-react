import { DialingType } from 'modules/huron/dialing/index';
import { DialingService } from 'modules/huron/dialing';
import { LineService, LineConsumerType, Line, LINE_CHANGE } from 'modules/huron/lines/services';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { Notification } from 'modules/core/notifications';

class PlaceCallOverview implements ng.IComponentController {

  public currentPlace;
  public hasSparkCall: boolean;
  public actionList: IActionItem[];
  public features: IFeature[];

  public directoryNumbers: Line[];

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    private LineService: LineService,
    private DialingService: DialingService,
    private Notification: Notification,
  ) {
    this.currentPlace = this.$stateParams.currentPlace;
    this.hasSparkCall = this.hasEntitlement('ciscouc');
    this.$scope.$on(DialingType.INTERNATIONAL, (_e, data) => {
      this.DialingService.setInternationalDialing(data, LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
        this.DialingService.initializeDialing(LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
          this.initFeatures();
        });
      }, (response) => {
        this.Notification.errorWithTrackingId(response, 'internationalDialingPanel.error');
      });
    });
    this.$scope.$on(DialingType.LOCAL, (_e, data) => {
      this.DialingService.setLocalDialing(data, LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
        this.DialingService.initializeDialing(LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
          this.initFeatures();
        });
      }, (response) => {
        this.Notification.errorWithTrackingId(response, 'internationalDialingPanel.error');
      });
    });
    this.$scope.$on(LINE_CHANGE, () => {
      this.initNumbers();
    });
  }

  public $onInit(): void {
    if (this.hasSparkCall) {
      this.initActions();
      this.DialingService.initializeDialing(LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
        this.initFeatures();
      });
      this.initNumbers();
    }
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
    let service: IFeature;
    if (this.currentPlace.type === 'huron') {
      service = {
        name: this.$translate.instant('telephonyPreview.speedDials'),
        state: 'speedDials',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(service);
    }
    service = {
      name: this.$translate.instant('telephonyPreview.internationalDialing'),
      state: 'internationalDialing',
      detail: this.DialingService.getInternationalDialing(LineConsumerType.PLACES),
      actionAvailable: true,
    };
    this.features.push(service);
    if (this.currentPlace.type === 'huron') {
      service = {
        name: this.$translate.instant('telephonyPreview.localDialing'),
        state: 'local',
        detail: this.DialingService.getLocalDialing(LineConsumerType.PLACES),
        actionAvailable: true,
      };
      this.features.push(service);
    }
  }

  private initNumbers(): void {
    this.LineService.getLineList(LineConsumerType.PLACES, this.currentPlace.cisUuid)
      .then(lines => this.directoryNumbers = lines);
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
      watcher: feature.state === 'local' ? DialingType.LOCAL : DialingType.INTERNATIONAL,
      selected: feature.state === 'local' ? this.DialingService.getLocalDialing(LineConsumerType.PLACES) : this.DialingService.getInternationalDialing(LineConsumerType.PLACES),
      currentPlace: this.currentPlace,
    });
  }
}

export class PlaceCallOverviewComponent implements ng.IComponentOptions {
  public controller = PlaceCallOverview;
  public templateUrl = 'modules/squared/places/callOverview/placeCallOverview.html';
}
