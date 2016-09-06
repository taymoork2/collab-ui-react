import { IDirectoryNumber } from '../../../huron/overview/directoryNumberList.component';
import { INT_DIAL_CHANGE } from '../../../huron/internationalDialing';
import { InternationalDialingService } from '../../../huron/internationalDialing/internationalDialing.service';
import { LineService, LineConsumerType, Number } from '../../../huron/lines/services';
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
    private InternationalDialingService: InternationalDialingService
  ) {
    this.currentPlace = $stateParams.currentPlace;
    this.directoryNumbers = this.currentPlace.numbers;
    $scope.$on(INT_DIAL_CHANGE, (data) => {
      this.initFeatures();
    });
  }

  private $onInit(): void {
    this.initActions();
    this.initFeatures();
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
      state: 'international',
      detail: this.InternationalDialingService.getInternationalDialing().label,
      actionsAvailable: true
    }
    this.features.push(service);
  }

  public featureActions(feature) {
    if (feature === 'international') {
      this.$state.go('place-overview.communication.internationalDialing', {
        currentPlace: this.currentPlace
      });
    }
  }
}

export class PlaceCallOverviewComponent {
  public controller = PlaceCallOverview;
  public templateUrl = 'modules/squared/places/callOverview/placeCallOverview.html';
}
