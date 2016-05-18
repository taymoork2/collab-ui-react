'use strict';

describe('InviteCtrl', function () {

  var $rootScope, $controller, $timeout, Inviteservice, WindowLocation;

  beforeEach(module('Squared'));

  beforeEach(inject(function ($q, _$rootScope_, _$controller_, _$timeout_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    WindowLocation = {
      set: sinon.stub()
    };
  }));

  it('should redirect if there is no user param in the URL', function () {
    expect(WindowLocation.set.called).toBe(false);
    initController();
    $timeout.flush();
    expect(WindowLocation.set.called).toBe(true);
  });

  it('should redirect if a user and a cookie', function () {
    expect(WindowLocation.set.called).toBe(false);
    initController({
      user: 'a'
    }, {
      orgId: 123
    });
    $timeout.flush();
    expect(WindowLocation.set.called).toBe(true);
  });

  function initController(locationSearch, cookie) {
    locationSearch = locationSearch || {};
    $controller('InviteCtrl', {
      WindowLocation: WindowLocation,
      $location: {
        search: sinon.stub().returns(locationSearch)
      }
    });
  }
});
