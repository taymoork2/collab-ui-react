request = require('request').defaults({jar: true})

auth =
  'sqtest-admin':
    user: 'sqtest-admin@squared.example.com'
    pass: 'C1sc0123!'
    org:  '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5'
  'pbr-admin':
    user: 'pbr-org-admin@squared2webex.com'
    pass: 'C1sc0123!'
    org:  '4214d345-7caf-4e32-b015-34de878d1158'
  'partner-admin':
    user: 'atlaspartneradmin@atlas.test.com'
    pass: 'C1sc0123!'
    org:  'c054027f-c5bd-4598-8cd8-07c08163e8cd'

clientId = 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec'
clientSecret = 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857'

getSSOToken = (creds, cb) ->
  opts =
    url: 'https://idbroker.webex.com/idb/UI/Login?org=' + creds.org
    headers:
      'Content-Type': 'application/x-www-form-urlencoded'
    form:
      IDToken1: creds.user
      IDToken2: creds.pass
    jar: true

  request.post opts, (err, res, body) ->
    if err
      console.error err, body
      throw new Error 'Failed to fetch SSO token from CI'
    cb()

getAuthCode = (creds, cb) ->
  opts =
    url: 'https://idbroker.webex.com/idb/oauth2/v1/authorize'
    headers:
      'Content-Type': 'application/x-www-form-urlencoded'
    form:
      response_type: 'code'
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
      client_id: clientId
      # scope: 'Identity:SCIM Identity:Organization Identity:Config'
      scope: 'webexsquare:admin Identity:SCIM Identity:Config Identity:Organization'
      realm: '/' + creds.org
      state: 'this-should-be-a-random-string-for-security-purpose'

  request.post opts, (err, res, body) ->
    if err
      console.error err, body
      throw new Error 'Failed to fetch Auth Code from CI'

    code = body.match(/<title>(.*)</)[1]

    if not code
      console.error body
      throw new Error 'Failed to extract Auth Code'

    cb(code)

getAccessToken = (code, cb) ->
  opts =
    url: 'https://idbroker.webex.com/idb/oauth2/v1/access_token'
    headers:
      'Content-Type': 'application/x-www-form-urlencoded'
    form:
      code: code
      grant_type: 'authorization_code'
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
    auth:
      user: clientId
      pass: clientSecret

  request.post opts, (err, res, body) ->
    if err
      console.error err, body
      throw new Error 'Failed to fetch Access Token from CI'

    obj = try
      JSON.parse(body)
    catch e
      console.error body
      throw new Error 'Failed to parse Access Token JSON'

    if not obj?.access_token
      console.error body
      throw new Error 'Failed to extract Access Token'

    cb(obj.access_token)

module.exports =
  getBearerToken: (user, callback) ->
    creds = auth[user]
    throw new Error('Credentials for ' + user + ' not found') unless creds

    getSSOToken creds, ->
      getAuthCode creds, (authCode) ->
        getAccessToken authCode, callback
