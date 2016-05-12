'use strict';

describe('InviteCtrl', function () {

  var $rootScope, $controller, $cookies, Inviteservice, WindowLocation;

  beforeEach(module('Squared'));

  beforeEach(inject(function ($q, _$rootScope_, _$controller_, _$cookies_, _Inviteservice_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $cookies = _$cookies_;
    Inviteservice = _Inviteservice_;
    WindowLocation = {
      set: sinon.stub()
    };
    sinon.stub(Inviteservice, 'resolveInvitedUser').returns($q.when({
      data: {}
    }));
  }));

  it('should redirect if there is no user param in the URL', function () {
    expect(WindowLocation.set.called).toBe(false);
    initController();
    expect($cookies.getObject.called).toBe(false);
    expect(WindowLocation.set.called).toBe(true);
  });

  it('should redirect if a user and a cookie', function () {
    expect(WindowLocation.set.called).toBe(false);
    initController({
      user: 'a'
    }, {
      orgId: 123
    });
    expect($cookies.getObject.called).toBe(true);
    expect(WindowLocation.set.called).toBe(true);
  });

  it('should call Inviteservice.resolveInvitedUser and set cookie if a user but no cookie', function () {
    expect(WindowLocation.set.called).toBe(false);
    initController({
      user: 'a'
    });
    expect($cookies.getObject.called).toBe(true);
    expect(Inviteservice.resolveInvitedUser.called).toBe(true);
    $rootScope.$digest();
    expect($cookies.putObject.called).toBe(true);
    expect(WindowLocation.set.called).toBe(true);
  });

  function initController(locationSearch, cookie) {
    locationSearch = locationSearch || {};
    sinon.stub($cookies, 'getObject').returns(cookie);
    sinon.spy($cookies, 'putObject');
    $controller('InviteCtrl', {
      WindowLocation: WindowLocation,
      $location: {
        search: sinon.stub().returns(locationSearch)
      }
    });
  }
});
