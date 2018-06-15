declare namespace csdm {

  interface IPlaceExtended extends IPlace {
    readableType: string;
  }

  interface IPlace extends IDevicePlaceCommon {
    locationUuid?: string;
    externalNumber?: string;
    directoryNumber?: string;
    devices: {};
    id?: string;
    entitlements?: any[];
    externalLinkedAccounts?: any[];
  }

  interface ICsdmDataModelService {
    updateCloudberryPlace(objectToUpdate: IPlace, {
      entitlements, directoryNumber,
      externalNumber, externalLinkedAccounts,
    }: IUpdatePlaceParameters): ng.IPromise<IPlace>;
    createCmiPlace(name, entitlements, locationUuid, directoryNumber, externalNumber): ng.IPromise<IPlace>;
    createCsdmPlace(name, entitlements, locationUuid , directoryNumber, externalNumber, externalLinkedAccounts: IExternalLinkedAccount[]): ng.IPromise<IPlace>;
    createCodeForExisting(cisUuid: string): ng.IPromise<ICode>;
    reloadPlace(cisUuid: string): ng.IPromise<IPlace>;
    reloadItem<T extends IDevicePlaceCommon>(item: T): ng.IPromise<T>;
    updateItemName(item: IPlace, newName: string): ng.IPromise<IPlace>;
    isBigOrg(): ng.IPromise<boolean>;
    getPlacesMap(refreshIfOld: boolean): ng.IPromise<{ [url: string]: IPlace; }>;
    getSearchPlacesMap(searchString: string): ng.IPromise<{ [url: string]: IPlace; }>;
    getDevicesMap(refreshHuron: boolean): ng.IPromise<{ [url: string]: IDevice; }>;
    subscribeToChanges($scope: ng.IScope, listener: Function): void;
    updateTags(objectToUpdate: IDevicePlaceCommon, newTags: string[]);
  }
  export interface IExternalLinkedAccount {
    providerID: string;
    accountGUID: string;
    status?: string;
    operation?: string;
  }

  export interface IUpdatePlaceParameters {
    entitlements?: string[];
    directoryNumber?: string;
    externalNumber?: string;
    externalLinkedAccounts: IExternalLinkedAccount[] | null;
  }
}
