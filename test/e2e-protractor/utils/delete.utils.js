'use strict';

var config = require('./test.config.js');
var utils = require('./test.utils.js');
var request = require('request');
var Promise = require('promise');

exports.deleteUser = function (email, token) {
  return new Promise(function (resolve, reject) {
      resolve(token || utils.getToken());
    })
    .then(function (token) {
      var options = {
        method: 'delete',
        url: config.getAdminServiceUrl() + 'user?email=' + encodeURIComponent(email),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      };

      return utils.sendRequest(options).then(function () {
        return 200;
      });
    });
};

exports.deleteSquaredUCUser = function (customerUuid, userUuid, token) {
  var options = {
    method: 'delete',
    url: config.getCmiServiceUrl() + 'common/customers/' + customerUuid + '/users/' + userUuid,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  return utils.sendRequest(options).then(function () {
    return 204;
  });
};

exports.deleteSquaredUCCustomer = function (customerUuid, token) {
  var options = {
    method: 'delete',
    url: config.getCmiServiceUrl() + 'common/customers/' + customerUuid,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  return utils.sendRequest(options).then(function () {
    return 204;
  });
};

// deleteAutoAttendant - Delete a specific autoattendant
//
// Called by deleteTestAA below.
exports.deleteAutoAttendant = function (aaUrl, token) {
  var options = {
    method: 'delete',
    url: aaUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  return utils.sendRequest(options).then(function (result) {
    return 200;
  });
};

exports.extractUUID = function (ceURL) {
  var uuidPos = ceURL.lastIndexOf("/");
  if (uuidPos === -1) {
    return '';
  }
  return ceURL.substr(uuidPos + 1);
};

// deleteNumberAssignments - Delete AA CMI number assignments
//
// Called by deleteTestAA below.
exports.deleteNumberAssignments = function (aaUrl, token) {

  var ceId = exports.extractUUID(aaUrl);

  var cmiUrl = config.getCmiV2ServiceUrl() + 'customers/' + helper.auth['aa-admin'].org + '/features/autoattendants/' + ceId + '/numbers';

  var options = {
    method: 'delete',
    url: cmiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  return utils.sendRequest(options).then(function (result) {
    return 200;
  });
};

// Save the test AA name here, this is also accessed from
// auto-attendant_spec.js
exports.testAAName = 'AA for Atlas e2e Tests';
exports.testAAImportName = 'AA for Atlas e2e Import Tests';

// deleteTestAA - Delete a single AA via the CES API
//
// bearer - token with access to our API
// aaUrl - the AA URL
exports.deleteTestAA = function (bearer, aaUrl) {

  var aaDeleteTasks = [];

  aaDeleteTasks.push(exports.deleteAutoAttendant(aaUrl, bearer));
  aaDeleteTasks.push(exports.deleteNumberAssignments(aaUrl, bearer));
  aaDeleteTasks.push(exports.deleteTestSchedule(aaUrl, bearer));
  return Promise.all(aaDeleteTasks);
}

// deleteTestAAs - Delete the Test AAs via the CES API
//
// Check all of the autoattendants eturned for this
// customer and if our test one is there send it to
// deleteAutoAttendant().
//
// Called by findAndDeleteTestAA below
//
// bearer - token with access to our API
// data - query results from our CES GET API
exports.deleteTestAAs = function (bearer, data) {
  var test = [this.testAAName, this.testAAImportName];
  for (var i = 0; i < data.length; i++) {
    var AAsToDelete = [];

    if (data[i].callExperienceName === test[0] || data[i].callExperienceName === test[1]) {
      AAsToDelete.push(exports.deleteTestAA(bearer, data[i].callExperienceURL));
    }

  }

  return Promise.all(AAsToDelete);

};

//
// findAndDeleteTestAA - Find the Test AA and call delete
//
// Used to cleanup AA created in the test
exports.findAndDeleteTestAA = function () {

  helper.getBearerToken('aa-admin')
    .then(function (bearer) {
      var options = {
        url: config.getAutoAttendantsUrl(helper.auth['aa-admin'].org),
        headers: {
          Authorization: 'Bearer ' + bearer
        }
      };

      var defer = protractor.promise.defer();
      request(options,
        function (error, response, body) {
          if (!error && response.statusCode === 200) {
            defer.fulfill(JSON.parse(body));
          } else {
            defer.reject({
              error: error,
              message: body
            });
          }
        });
      return defer.promise.then(function (data) {
        return exports.deleteTestAAs(bearer, data);
      });

    });
};

//deleteSchedules - Delete schedules ccreated in last test run
// Called by deleteTestAA below.
exports.deleteSchedules = function (scheduleUrl, token) {
  var options = {
    method: 'delete',
    url: scheduleUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };
  return utils.sendRequest(options).then(function (results) {
    return 200;
  });
};

/**
 *This will delete the  required schedule
 */
exports.deleteTestSchedule = function (aaUrl, token) {
  var options = {
    method: 'get',
    url: aaUrl,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  request(options,
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var scheduleId = JSON.parse(body).scheduleId;
        if (scheduleId !== undefined) {
          var scheduleUrl = config.getAutoAttendantsSchedulesUrl(helper.auth['huron-int1'].org, scheduleId);
          return exports.deleteSchedules(scheduleUrl, token);
        }
      }
    });
};
