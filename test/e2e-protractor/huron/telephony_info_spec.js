'use strict';

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as non-sso admin user', function() {
  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });
}); //State is logged-in



// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    navigation.logout();
  });
});
