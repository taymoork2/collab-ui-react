'use strict';

angular.module('Hercules')
  .service('MailValidatorService', [
    function MailValidatorService() {

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
