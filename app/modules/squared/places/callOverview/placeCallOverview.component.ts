import { IDirectoryNumber } from '../../../huron/overview/directoryNumberList.component';

class PlaceCallOverviewCtrl {

  private _currentPlace;

  public directoryNumbers: IDirectoryNumber[] = [];

  get currentPlace() {
    return this._currentPlace;
  }

  /* @ngInject */
  constructor(
    private $stateParams
  ) {
    this._currentPlace = $stateParams.currentPlace;
  }
}
angular
  .module('Squared')
  .component('placeCallOverview', {
    templateUrl: 'modules/squared/places/callOverview/placeCallOverview.tpl.html',
    controller: PlaceCallOverviewCtrl
  });
