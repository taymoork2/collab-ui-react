/* @ngInject */
import IPlace = csdm.IPlace;
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { FilteredView } from '../common/filtered-view/filtered-view';
import { FilteredPlaceViewDataSource } from './FilteredPlaceViewDataSource';
import { PlaceMatcher } from './place-matcher';

function CsdmFilteredViewFactory(CsdmDataModelService: ICsdmDataModelService,
                                 $timeout: ng.ITimeoutService,
                                 $q: ng.IQService): { createFilteredPlaceView(): FilteredView<IPlace> } {
  return {
    createFilteredPlaceView: () => {
      return new FilteredView<IPlace>(new FilteredPlaceViewDataSource(CsdmDataModelService),
        new PlaceMatcher(),
        $timeout,
        $q);
    },
  };
}

export default angular
  .module('Squared')
  .factory('CsdmFilteredViewFactory', CsdmFilteredViewFactory)
  .name;
