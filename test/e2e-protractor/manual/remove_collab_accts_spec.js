'use strict';

describe('Remove bulk created accounts from Admin account', function () {

  it('should login as an account admin', function () {
    login.login('account-admin', '#/users');
  });

  it('should remove lingering accounts', function () {
    var name = 'collabctg+config_user';
    // Uncomment below if you want everything collabctg related.
    name = 'collabctg+';
    var removeCount = 0;
    for ( var i = 0; i < 500; i++ )
    {
      utils.quickDeleteUser((i === 0), name).then( function() {
        removeCount++;
      });
    }
  }, 60000 * 30); // 30 minutes
});
