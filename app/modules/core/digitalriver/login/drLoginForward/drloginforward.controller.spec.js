
(function () {
  'use strict';

  describe('Controller: drLoginForwardController', function () {
    var controller, $controller, $cookies;

    var userServiceJSONFixture = getJSONFixture('core/json/users/me.json');

    beforeEach(module('Core'));
    beforeEach(module('Huron'));

    beforeEach(inject(function ($rootScope, _$controller_, _Userservice_, $cookies) {
      $controller = _$controller_;
      $cookies = $cookies;
      spyOn(Userservice, 'getUser').and.callFake(function (callback, status) {
        callback(userServiceJSONFixture, 200);
      });

      spyOn(Userservice, 'getUserAuthToken').and.callFake(function (callback, status) {
        callback({
          data: {
            success: true,
            data: {
              token: 'RkpqykhUQJxNcKZ8TeG7Tt4cwa7WAsdKHfGftERvsDV7ZmyuOqapBidHyhbaCOFPRECk5sRQzNIunbw0ch2Ftg=='
            }
          },
          status: 200,
          config: "abc",
          statusText: "OK"
        }, 200);
      });

      function initController() {
        controller = $controller('drLoginForwardController', {});
      }

      describe('should return userauthtoken', function () {
        beforeEach(initController);

        it('should return userauthtoken', function () {

          expect($cookies.atlasDrCookie).toEqual('RkpqykhUQJxNcKZ8TeG7Tt4cwa7WAsdKHfGftERvsDV7ZmyuOqapBidHyhbaCOFPRECk5sRQzNIunbw0ch2Ftg==');
        });

      });

    }));

  });

})();
