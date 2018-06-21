import { Dictionary } from 'lodash';

export class CsdmCacheUpdater {
  /* @ngInject  */
  constructor() {
  }

  public updateSingle<T>(currentObj: T, updatedObj: T, mergeOnly): T {
    if (!mergeOnly) {
      _.forEach(currentObj, (...args) => {
        const [, key] = args;
        delete currentObj[key];
      });
    }
    _.forEach(updatedObj, (value, key: string) => {
      currentObj[key] = value;
    });
    return currentObj;
  }

  public updateOne<T>(current: Dictionary<T>, url: string, updatedObj: T, addedFunction?: (T) => void, mergeOnly?: boolean): T {
    if (!current[url]) {
      current[url] = updatedObj;
      if (addedFunction) {
        addedFunction(updatedObj);
      }
      return updatedObj;
    } else {
      return this.updateSingle(current[url], updatedObj, mergeOnly);
    }
  }

  private addAndUpdate<T>(current: Dictionary<T>, updated: Dictionary<T>, addedFunction?: (T) => void) {
    _.forEach(updated, (updatedObj, url) => {
      this.updateOne(current, url || '', updatedObj, addedFunction);
    });
  }

  private removeDeleted<T>(current: Dictionary<T>, updated: Dictionary<T>, keepFunction?: (T) => void) {
    _.forEach(_.difference(_.keys(current), _.keys(updated)), (deletedUrl) => {
      if (!keepFunction || !keepFunction(current[deletedUrl])) {
        delete current[deletedUrl];
      }
    });
  }

  public update<T>(current: Dictionary<T>, updated: Dictionary<T>, keepFunction?: (T) => boolean, addedFunction?: (T) => void): Dictionary<T> {
    this.addAndUpdate(current, updated, addedFunction);
    this.removeDeleted(current, updated, keepFunction);
    return current;
  }
}

module.exports = angular
  .module('squared.csdmCacheUpdater', [])
  .service('CsdmCacheUpdater', CsdmCacheUpdater)
  .name;
