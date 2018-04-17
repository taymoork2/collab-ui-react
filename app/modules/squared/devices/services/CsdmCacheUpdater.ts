export class CsdmCacheUpdater {
  /* @ngInject  */
  constructor() {
  }

  public updateSingle(currentObj, updatedObj, mergeOnly) {
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

  public updateOne(current, url, updatedObj, addedFunction?, mergeOnly?: boolean) {
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

  private addAndUpdate(current, updated, addedFunction) {
    _.forEach(updated, (updatedObj, url) => {
      this.updateOne(current, url, updatedObj, addedFunction);
    });
  }

  private removeDeleted(current, updated, keepFunction) {
    _.forEach(_.difference(_.keys(current), _.keys(updated)), (deletedUrl) => {
      if (!keepFunction || !keepFunction(current[deletedUrl])) {
        delete current[deletedUrl];
      }
    });
  }

  public update(current, updated, keepFunction?, addedFunction?) {
    this.addAndUpdate(current, updated, addedFunction);
    this.removeDeleted(current, updated, keepFunction);
    return current;
  }
}

module.exports = angular
  .module('squared.csdmCacheUpdater', [])
  .service('CsdmCacheUpdater', CsdmCacheUpdater)
  .name;
