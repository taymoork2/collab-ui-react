'use strict';

angular.module('Squared').service('CsdmCacheUpdater',

  /* @ngInject  */
  function () {

    var addAndUpdate = function (current, updated) {
      _.each(updated, function (updatedObj, updatedUrl) {
        if (!current[updatedUrl]) {
          current[updatedUrl] = updatedObj;
        } else {
          if (objectsAreDifferent(current[updatedUrl], updatedObj)) {
            current[updatedUrl] = updatedObj;
          }
        }
      });
    };

    var removeDeleted = function (current, updated) {
      _.each(_.difference(_.keys(current), _.keys(updated)), function (deletedUrl) {
        delete current[deletedUrl];
      });
    };

    var objectsAreDifferent = function (current, updated) {
      return JSON.stringify(current) != JSON.stringify(updated);
    };

    return {
      addUpdateAndRemove: function (current, updated) {
        addAndUpdate(current, updated);
        removeDeleted(current, updated);
      },
      addAndUpdate: function (current, updated) {
        addAndUpdate(current, updated);
      }
    };

  }
);
