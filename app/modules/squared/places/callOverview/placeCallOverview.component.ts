import { IDirectoryNumber } from '../../../huron/overview/directoryNumberList.component';
import { ActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';

class PlaceCallOverviewCtrl {

  private _currentPlace;
  private actionList: ActionItem[];

  public directoryNumbers: IDirectoryNumber[] = [];

  get currentPlace() {
    return this._currentPlace;
  }

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams
  ) {
    this._currentPlace = $stateParams.currentPlace;
  }

  private $onInit(): void {
    this.initActions();
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'usersPreview.addNewLinePreview',
      actionFunction: () => {
        this.$state.go('place-overview.communication.line-overview');
      },
    }];
  }
}
angular
  .module('Squared')
  .component('placeCallOverview', {
    templateUrl: 'modules/squared/places/callOverview/placeCallOverview.tpl.html',
    controller: PlaceCallOverviewCtrl
  });
