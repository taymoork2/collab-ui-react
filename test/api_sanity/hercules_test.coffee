_       = require 'lodash'
assert  = require 'assert'
request = require 'request'
helper  = require './test_helper'

describe 'hercules api ( stimurbe@cisco.com ) -',  ->
  it 'should fetch cluster data', (done) ->
    helper.getBearerToken 'pbr-admin', (bearer) ->
      opts =
        url: 'https://hercules-integration.wbx2.com/v1/clusters'
        auth: bearer: bearer
      request.get opts, (err, res, body) ->
        assert not err, JSON.stringify(err)
        assert.equal 200, res.statusCode
        data = helper.parseJSON(body)
        assert _.isArray(data)
        done()
