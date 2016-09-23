(function () {
  'use strict';

  angular.module('Squared').service('CsdmCacheUpdater',

    /* @ngInject  */
    function () {

      var updateOne = function (current, url, updatedObj) {
        if (!current[url]) {
          current[url] = updatedObj;
        } else {
          var currentObj = current[url];
          _.each(currentObj, function (value, key) {
            delete currentObj[key];
          });
          _.each(updatedObj, function (value, key) {
            currentObj[key] = value;
          });
        }
      };

      var addAndUpdate = function (current, updated) {
        _.each(updated, function (updatedObj, url) {
          updateOne(current, url, updatedObj);
        });
      };

      var removeDeleted = function (current, updated, keepFunction) {
        _.each(_.difference(_.keys(current), _.keys(updated)), function (deletedUrl) {
          if (!keepFunction || !keepFunction(current[deletedUrl])){
            delete current[deletedUrl];
          }
        });
      };

      return {
        update: function (current, updated, keepFunction) {
          addAndUpdate(current, updated);
          removeDeleted(current, updated, keepFunction);
          return current;
        },
        updateOne: updateOne
      };

    }
  );
})();
