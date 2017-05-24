(function () {
  'use strict';

  var Feature = require('./feature.model').default;

  module.exports = OnboardService;

  /* @ngInject */
  function OnboardService() {
    var service = {
      huronCallEntitlement: false,
      validateEmail: validateEmail,
      usersToOnboard: [],
      maxUsersInManual: 25,
      mergeMultipleLicenseSubscriptions: mergeMultipleLicenseSubscriptions,
      getEntitlements: getEntitlements,
    };

    return service;

    ////////////////

    //email validation logic
    function validateEmail(input) {
      var emailregex = /\S+@\S+\.\S+/;
      var emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
      var emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
      var valid = false;

      if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
        valid = true;
      } else if (/["]/.test(input) && emailregexquotes.test(input)) {
        valid = true;
      } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
        valid = true;
      }

      return valid;
    }

    function mergeMultipleLicenseSubscriptions(fetched) {
      // Construct a mapping from License to (array of) Service object(s)
      var services = fetched.reduce(function (object, serviceObj) {
        var key = serviceObj.license.licenseType;
        if (key in object) {
          object[key].push(serviceObj);
        } else {
          object[key] = [serviceObj];
        }
        return object;
      }, {});

      // Merge all services with the same License into a single serviceObj
      return _.values(services).map(function (array) {
        var result = {
          licenses: [],
        };
        array.forEach(function (serviceObj) {
          var copy = _.cloneDeep(serviceObj);
          copy.licenses = [copy.license];
          delete copy.license;
          _.mergeWith(result, copy, function (left, right) {
            if (_.isArray(left)) return left.concat(right);
          });
        });
        return result;
      });
    }

    function getEntitlements(action, entitlements) {
      var result = [];
      _.forEach(entitlements, function (state, key) {
        if (state) {
          if (action === 'add' || action === 'entitle') {
            result.push(new Feature(key, state));
          }
        }
      });
      return result;
    }
  }
})();
