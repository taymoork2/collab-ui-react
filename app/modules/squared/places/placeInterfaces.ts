/**
 * Created by ngrodum on 29/03/2017.
 */

declare namespace csdm {

  interface IPlace {
    devices: {};
    cisUuid?: string;
    id?: string;
    type?: string;
    url?: string;
    entitlements?: Array<any>;
    displayName?: string;
    externalLinkedAccounts?: any[];
    tags: string[];
  }

  interface ICsdmDataModelService {
    updateCloudberryPlace(objectToUpdate: IPlace, entitlements, directoryNumber,
                          externalNumber, externalLinkedAccounts?: any[]): ng.IPromise<IPlace>;
    reloadPlace(cisUuid: string): ng.IPromise<IPlace>;
    reloadItem(item: IPlace): ng.IPromise<IPlace>;
    updateItemName(item: IPlace, newName: string): ng.IPromise<IPlace>;
    isBigOrg(): ng.IPromise<boolean>;
    getPlacesMap(refreshIfOld: boolean): ng.IPromise<{ [url: string]: IPlace; }>;
    getSearchPlacesMap(searchString: string): ng.IPromise<{ [url: string]: IPlace; }>;
  }
}
