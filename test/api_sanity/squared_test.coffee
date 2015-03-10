_       = require 'lodash'
assert  = require 'assert'
request = require 'request'
helper  = require './test_helper'

describe 'squared api ( jkuiros@cisco.com ) -',  ->

  describe 'pbr-admin', ->

    bearer = null

    before (done) ->
      helper.getBearerToken 'pbr-admin', (b) ->
        bearer = b
        done()

    it 'should fetch unlicensed users data', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/4214d345-7caf-4e32-b015-34de878d1158/unlicensedUsers'
        auth: bearer: bearer
      request.get opts, (err, res, body) ->
        data = JSON.parse(body)
        assert _.isObject(data)
        assert.equal 200, res.statusCode
        done()

    it 'should fetch partner admins', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/users/partneradmins'
        auth: bearer: bearer
      request.get opts, (err, res, body) ->
        data = JSON.parse(body)
        assert _.isObject(data)
        assert.equal 200, res.statusCode
        done()

    it 'should search for a user', (done) ->
      opts =
        url: 'https://identity.webex.com/identity/scim/4214d345-7caf-4e32-b015-34de878d1158/v1/Users?filter=userName%20sw%20%22yolo%22%20or%20name.givenName%20sw%20%22yolo%22%20or%20name.familyName%20sw%20%22yolo%22&attributes=name,userName,userStatus,entitlements,displayName,photos,roles&count=100&sortBy=name&sortOrder=ascending'
        auth: bearer: bearer
      request.get opts, (err, res, body) ->
        data = JSON.parse(body)
        assert _.isObject(data)
        assert.equal 200, res.statusCode
        done()

  describe 'partner-admin', ->

    bearer = null

    before (done) ->
      helper.getBearerToken 'pbr-admin', (b) ->
        bearer = b
        done()

    it 'should fetch managed orgs', (done) ->
      opts =
        url: 'https://atlas-integration.wbx2.com/admin/api/v1/organizations/c054027f-c5bd-4598-8cd8-07c08163e8cd/managedOrgs'
        auth: bearer: bearer
      request.get opts, (err, res, body) ->
        data = JSON.parse(body)
        assert _.isObject(data)
        assert.equal 200, res.statusCode
        done()
