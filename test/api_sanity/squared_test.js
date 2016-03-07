var _ = require('lodash');
var assert = require('assert');
var request = require('request');
var helper = require('./test_helper');

var refuteError = function (err) {
  return assert(!err, JSON.stringify(err));
};

var assertStatusCode = function (status, res) {
  return assert.equal(status, res.statusCode, "Expected status " + status + " but was " + res.statusCode + ". Response: " + res.body);
};

var twoMinutes = 1000 * 60 * 2;

describe('atlas api -', function () {
  return describe('as customer-support-admin', function () {
    before(function (done) {
      return helper.getBearerToken('customer-support-admin', (function (_this) {
        return function (bearer) {
          _this.bearer = bearer;
          return done();
        };
      })(this));
    });
    it('should read user auth info', function (done) {
      var opts;
      opts = {
        url: 'https://atlas-a.wbx2.com/admin/api/v1/userauthinfo',
        auth: {
          bearer: this.bearer
        }
      };
      return request.get(opts, function (err, res, body) {
        var data;
        refuteError(err);
        assertStatusCode(200, res);
        data = helper.parseJSON(body);
        assert(_.isObject(data));
        return done();
      });
    });
    return it('should list managed orgs', function (done) {
      var opts;
      this.timeout(twoMinutes);
      opts = {
        url: 'https://atlas-a.wbx2.com/admin/api/v1/organizations/c1e59258-29e1-42d7-bfa7-84ab26632b46/managedOrgs',
        auth: {
          bearer: this.bearer
        }
      };
      return request.get(opts, function (err, res, body) {
        var data;
        refuteError(err);
        assertStatusCode(200, res);
        data = helper.parseJSON(body);
        assert(_.isObject(data));
        return done();
      });
    });
  });
});
