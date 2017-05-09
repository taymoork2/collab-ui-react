import IDevice = csdm.IDevice;
import ICsdmDataModelService = csdm.ICsdmDataModelService;

export class FilteredDeviceViewDataSource implements IFilteredViewDataSource<IDevice> {
  constructor(private CsdmDataModelService: ICsdmDataModelService, private $q) {
  }

  public getAll(): IPromise<{ [url: string]: IDevice; }> {
    return this.CsdmDataModelService.getDevicesMap(true);
  }

  public search(): IPromise<{ [url: string]: IDevice; }> {
    return this.getAll();
  }

  public isSearchOnly(): IPromise<boolean> {
    return this.$q.resolve(false);
  }
}
