import IPlace = csdm.IPlace;
import ICsdmDataModelService = csdm.ICsdmDataModelService;

export class FilteredPlaceViewDataSource implements IFilteredViewDataSource<IPlace> {
  constructor(private CsdmDataModelService: ICsdmDataModelService) {
  }

  public getAll(): IPromise<{ [url: string]: IPlace; }> {
    return this.CsdmDataModelService.getPlacesMap(true);
  }

  public search(term: string): IPromise<{ [url: string]: IPlace; }> {
    return this.CsdmDataModelService.getSearchPlacesMap(term);
  }

  public isSearchOnly(): IPromise<boolean> {
    return this.CsdmDataModelService.isBigOrg();
  }
}
