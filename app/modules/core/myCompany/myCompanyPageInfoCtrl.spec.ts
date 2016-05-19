///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="myCompanyPageInfoCtrl.ts"/>
namespace myCompanyPage {
  describe('MyCompanyPageInfoCtrl', ()=> {
    let ctrl;

    beforeEach(angular.mock.module('Core'));
    describe('loading partners', ()=> {

      let listpartnerCall;
      beforeEach(inject(($injector, $controller)=> {
        listpartnerCall = {};
        ctrl = $controller('MyCompanyPageInfoCtrl', {
          UserListService: {
            listPartners: (orgId, callBack)=> {
              listpartnerCall.orgId = orgId;
              listpartnerCall.callBack = callBack;
            }
          }
        });
      }));

      it('with empty partner list should keep partners and representatives empty', ()=> {
        expect(listpartnerCall.callBack).toBeDefined();
        listpartnerCall.callBack({partners: []});
        expect(ctrl.partners).toHaveLength(0);
        expect(ctrl.representatives).toHaveLength(0);
      });

      it('with partner list with only partners should set partners and keep representatives empty', ()=> {
        listpartnerCall.callBack({partners: [{userName: 'something@example.com'}, {userName: 'something2@example.com'}]});
        expect(ctrl.partners).toHaveLength(2);
        expect(ctrl.representatives).toHaveLength(0);
      });

      it('with partner list with only representatives should keep partners empt and set representatives', ()=> {
        listpartnerCall.callBack({partners: [{userName: 'something@cisco.com'}, {userName: 'something2@cisco.com'}]});
        expect(ctrl.partners).toHaveLength(0);
        expect(ctrl.representatives).toHaveLength(2);
      });
    });

  });
}
