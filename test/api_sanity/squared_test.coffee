_       = require 'lodash'
assert  = require 'assert'
request = require 'request'
helper  = require './test_helper'

refuteError = (err) ->
  assert not err, JSON.stringify(err)

assertStatusCode = (status, res) ->
  assert.equal status, res.statusCode, "Expected status #{status} but was #{res.statusCode}. Response: #{res.body}"

describe 'squared api ( jkuiros@cisco.com ) -',  ->

  describe 'pbr-admin', ->

    before (done) ->
      helper.getBearerToken 'pbr-admin', (@bearer) =>
        done()

    it 'should fetch unlicensed users data', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/4214d345-7caf-4e32-b015-34de878d1158/unlicensedUsers'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = helper.parseJSON(body)
        assert _.isObject(data)
        done()

    it 'should fetch partner admins', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/users/partneradmins'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = helper.parseJSON(body)
        assert _.isObject(data)
        done()

    it 'should search for a user', (done) ->
      opts =
        url: 'https://identity.webex.com/identity/scim/4214d345-7caf-4e32-b015-34de878d1158/v1/Users?filter=userName%20sw%20%22yolo%22%20or%20name.givenName%20sw%20%22yolo%22%20or%20name.familyName%20sw%20%22yolo%22&attributes=name,userName,userStatus,entitlements,displayName,photos,roles&count=100&sortBy=name&sortOrder=ascending'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = JSON.parse(body)
        assert _.isObject(data)
        done()

  describe 'partner-admin', ->

    before (done) ->
      helper.getBearerToken 'partner-admin', (@bearer) =>
        done()

    it 'should fetch managed orgs', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/c054027f-c5bd-4598-8cd8-07c08163e8cd/managedOrgs'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = helper.parseJSON(body)
        assert _.isObject(data)
        done()

    it 'should fetch trials', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organization/c054027f-c5bd-4598-8cd8-07c08163e8cd/trials'
        auth: bearer: @bearer
      request.get opts, (err, res, body) ->
        refuteError err
        assertStatusCode 200, res
        data = helper.parseJSON(body)
        assert _.isObject(data)
        done()

    describe 'with a created partner trial', ->

      before (done) ->
        name = 'mocha_api_sanity_' + new Date().getTime().toString(16)
        opts =
          url: 'https://atlas-integration.wbx2.com/admin/api/v1/organization/c054027f-c5bd-4598-8cd8-07c08163e8cd/trials'
          auth: bearer: @bearer
          json:
            trialPeriod: 90
            customerName: name
            customerEmail: "#{name}@example.com"
            startDate: '2016-03-10T17:05:02.713Z'
            offers: [{id: "COLLAB", licenseCount: 100}]
          headers:
            'Content-Type': 'application/json'

        request.post opts, (err, res, body) =>
          refuteError err
          assertStatusCode 200, res
          assert not body?.errors, JSON.stringify(body)
          assert body.customerOrgId
          @trialOrgId = body.customerOrgId
          done()

      it 'should list its parter admins', (done) ->
        opts =
          url: 'https://atlas-integration.wbx2.com/admin/api/v1/organization/' + @trialOrgId + '/users/partneradmins'
          auth: bearer: @bearer

        request.get opts, (err, res, body) ->
          refuteError err
          assertStatusCode 200, res
          data = helper.parseJSON(body)
          assert _.isObject(data)
          done()

      it 'should delete it', (done) ->
        opts =
          url: 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/' + @trialOrgId
          auth: bearer: @bearer

        request.del opts, (err, res, body) ->
          refuteError err
          assertStatusCode 204, res
          done()
