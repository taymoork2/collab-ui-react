_       = require 'lodash'
assert  = require 'assert'
request = require 'request'
helper  = require './test_helper'

refuteError = (err) ->
  assert not err, JSON.stringify(err)

assertStatusCode = (status, res) ->
  assert.equal status, res.statusCode, "Expected status #{status} but was #{res.statusCode}. Response: #{res.body}"

twoMinutes = 1000 * 60 * 2

describe 'atlas api -',  ->

  describe 'as customer-support-admin', ->

    before (done) ->
      helper.getBearerToken 'customer-support-admin', (@bearer) =>
        done()

    it 'should read user auth info', (done) ->
      opts =
        url: 'https://atlas-a.wbx2.com/admin/api/v1/userauthinfo'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = helper.parseJSON(body)
        assert _.isObject(data)
        done()

    it 'should list managed orgs', (done) ->
      @timeout twoMinutes

      opts =
        url: 'https://atlas-a.wbx2.com/admin/api/v1/organizations/c1e59258-29e1-42d7-bfa7-84ab26632b46/managedOrgs'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = helper.parseJSON(body)
        assert _.isObject(data)
        done()