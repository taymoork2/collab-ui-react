import { IDirectoryNumber } from '../../../huron/overview/directoryNumberList.component';
import { LineService, LineConsumerType, Number } from '../../../huron/lines/services';
import { DialingType } from '../../../huron/dialing/index';
import { DialingService } from '../../../huron/dialing/dialing.service';
import { ActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';
import { IFeature } from '../../../core/components/featureList/featureList.component';

class PlaceCallOverview {

  public currentPlace;
  public actionList: ActionItem[];
  public features: IFeature[];

  public directoryNumbers: Number[];

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    private LineService: LineService,
    private DialingService: DialingService,
    private $q: ng.IQService,
    private Notification
  ) {
    this.currentPlace = $stateParams.currentPlace;
    this.directoryNumbers = this.currentPlace.numbers;
    $scope.$on(DialingType.INTERNATIONAL, (e, data) => {
      this.DialingService.setInternationalDialing(data, LineConsumerType.PLACES, this.currentPlace.cisUuid).then(()=> {
        this.DialingService.initializeDialing(LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
          this.initFeatures();
        });
      }, (response) => {
        Notification.errorResponse(response, 'internationalDialingPanel.error');
      });
    });
    $scope.$on(DialingType.LOCAL, (e, data) => {
      this.DialingService.setLocalDialing(data, LineConsumerType.PLACES, this.currentPlace.cisUuid).then(()=> {
        this.DialingService.initializeDialing(LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
          this.initFeatures();
        });
      }, (response) => {
        Notification.errorResponse(response, 'internationalDialingPanel.error');
      });
    });
  }

  private $onInit(): void {
    this.initActions();
    this.DialingService.initializeDialing(LineConsumerType.PLACES, this.currentPlace.cisUuid).then(() => {
      this.initFeatures();
    });
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'usersPreview.addNewLinePreview',
      actionFunction: () => {
        this.$state.go('place-overview.communication.line-overview');
      },
    }];
  }

  private initFeatures():void {
    this.features = [];
    let service: IFeature = {
      name: this.$translate.instant('telephonyPreview.internationalDialing'),
      icon: 'NO-ICON',
      state: 'internationalDialing',
      detail: this.DialingService.getInternationalDialing(LineConsumerType.PLACES),
      actionsAvailable: true,
    };
    this.features.push(service);
    service = {
      name: this.$translate.instant('telephonyPreview.localDialing'),
      icon: 'NO-ICON',
      state: 'local',
      detail: this.DialingService.getLocalDialing(LineConsumerType.PLACES),
      actionsAvailable: true,
    };
    this.features.push(service);
  }

  public featureActions(feature) {
    this.$state.go('place-overview.communication.'+ feature, {
      watcher: feature === 'local' ? DialingType.LOCAL: DialingType.INTERNATIONAL,
      selected: feature === 'local'? this.DialingService.getLocalDialing(LineConsumerType.PLACES): this.DialingService.getInternationalDialing(LineConsumerType.PLACES),
    });
  }
}

export class PlaceCallOverviewComponent {
  public controller = PlaceCallOverview;
  public templateUrl = 'modules/squared/places/callOverview/placeCallOverview.html';
}
