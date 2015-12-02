'use strict';

/* global _ */

angular.module('Mediafusion')
  .service('EmailValidatorService', [
    function EmailValidatorService() {

      var mailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

      var isValidEmailCsv = function (string) {
        return _.all(string.split(','), function (email) {
          return email.match(mailRegExp);
        });
      };

      return {
        isValidEmailCsv: isValidEmailCsv
      };
    }
  ]);
