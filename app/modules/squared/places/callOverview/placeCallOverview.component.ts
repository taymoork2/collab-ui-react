class PlaceCallOverviewCtrl {

  private _currentPlace;

  get currentPlace() {
    return this._currentPlace;
  }

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
