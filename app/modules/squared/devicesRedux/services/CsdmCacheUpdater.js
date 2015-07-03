'use strict';

angular.module('Squared').service('CsdmCacheUpdater',

  /* @ngInject  */
  function () {

    var addAndUpdate = function (current, updated) {
      _.each(updated, function (updatedObj, url) {
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
      });
    };

    var removeDeleted = function (current, updated) {
      _.each(_.difference(_.keys(current), _.keys(updated)), function (deletedUrl) {
        delete current[deletedUrl];
      });
    };

    return {
      update: function (current, updated) {
        addAndUpdate(current, updated);
        removeDeleted(current, updated);
        return current;
      }
    };

  }
);
