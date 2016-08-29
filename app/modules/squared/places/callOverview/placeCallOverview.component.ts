import { IDirectoryNumber } from '../../../huron/overview/directoryNumberList.component';
import { INT_DIAL_CHANGE } from '../../../huron/internationalDialing/internationalDialing';
import { InternationalDialingService } from '../../../huron/internationalDialing/internationalDialing.service';
import { ActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';
import { IFeature } from '../../../core/components/featureList/featureList.component';

class PlaceCallOverviewCtrl {

  private _currentPlace;
  private actionList: ActionItem[];

  public directoryNumbers: IDirectoryNumber[] = [];

  public features: IFeature[];

  get currentPlace() {
    return this._currentPlace;
  }

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams,
    private $translate: ng.translate.ITranslateService,
    private InternationalDialingService: InternationalDialingService
  ) {
    this._currentPlace = $stateParams.currentPlace;
    this.directoryNumbers = this._currentPlace.numbers;
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
        currentPlace: this._currentPlace
      });
    }
  }
}
angular
  .module('Squared')
  .component('placeCallOverview', {
    templateUrl: 'modules/squared/places/callOverview/placeCallOverview.tpl.html',
    controller: PlaceCallOverviewCtrl
  });
