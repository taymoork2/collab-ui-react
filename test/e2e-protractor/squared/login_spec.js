var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!',
};

describe('Login Page', function() {

  beforeEach(function() {
    browser.ignoreSynchronization = true;
  });

  afterEach(function() {
    browser.ignoreSynchronization = false;
  });

  it('should login and redirect to the requested users page', function() {
    login.loginTo('#/users', testuser.username, testuser.password);
  });

  it('should logout', function() {
    navigation.logout();
  });

});
