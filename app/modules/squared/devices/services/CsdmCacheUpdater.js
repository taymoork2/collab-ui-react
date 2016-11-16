(function () {
  'use strict';

  angular.module('Squared').service('CsdmCacheUpdater',

    /* @ngInject  */
    function () {

      var updateOne = function (current, url, updatedObj, addedFunction, mergeOnly) {
        if (!current[url]) {
          current[url] = updatedObj;
          if (addedFunction) {
            addedFunction(updatedObj);
          }
          return updatedObj;
        } else {
          var currentObj = current[url];
          if (!mergeOnly) {
            _.each(currentObj, function (value, key) {
              delete currentObj[key];
            });
          }
          _.each(updatedObj, function (value, key) {
            currentObj[key] = value;
          });
          return currentObj;
        }
      };

      var addAndUpdate = function (current, updated, addedFunction) {
        _.each(updated, function (updatedObj, url) {
          updateOne(current, url, updatedObj, addedFunction);
        });
      };

      var removeDeleted = function (current, updated, keepFunction) {
        _.each(_.difference(_.keys(current), _.keys(updated)), function (deletedUrl) {
          if (!keepFunction || !keepFunction(current[deletedUrl])) {
            delete current[deletedUrl];
          }
        });
      };

      return {
        update: function (current, updated, keepFunction, addedFunction) {
          addAndUpdate(current, updated, addedFunction);
          removeDeleted(current, updated, keepFunction);
          return current;
        },
        updateOne: updateOne
      };

    }
  );
})();
