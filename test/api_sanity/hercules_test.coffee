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
        data = helper.parseJSON(body)
        assert _.isArray(data)
        assert.equal 200, res.statusCode
        done()
