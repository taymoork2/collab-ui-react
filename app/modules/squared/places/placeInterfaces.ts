declare namespace csdm {

  interface IPlaceExtended extends IPlace {
    readableType: string;
  }

  interface IPlace extends IDevicePlaceCommon {
    externalNumber?: string;
    directoryNumber?: string;
    devices: {};
    id?: string;
    entitlements?: Array<any>;
    externalLinkedAccounts?: any[];
  }

  interface ICsdmDataModelService {
    updateCloudberryPlace(objectToUpdate: IPlace, entitlements, directoryNumber,
                          externalNumber, externalLinkedAccounts?: any[]): ng.IPromise<IPlace>;
    reloadPlace(cisUuid: string): ng.IPromise<IPlace>;
    reloadItem<T extends IDevicePlaceCommon>(item: T): ng.IPromise<T>;
    updateItemName(item: IPlace, newName: string): ng.IPromise<IPlace>;
    isBigOrg(): ng.IPromise<boolean>;
    getPlacesMap(refreshIfOld: boolean): ng.IPromise<{ [url: string]: IPlace; }>;
    getSearchPlacesMap(searchString: string): ng.IPromise<{ [url: string]: IPlace; }>;
    getDevicesMap(refreshHuron: boolean): ng.IPromise<{ [url: string]: IDevice; }>;
    devicePollerOn(event: string, listener: Function, options: { scope: angular.IScope }): void;
    subscribeToChanges($scope: ng.IScope, listener: Function): void;
  }
}
