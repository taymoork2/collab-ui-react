///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="ServicesOverviewCard.ts"/>
/// <reference path="ServicesOverviewHybridCard.ts"/>
/// <reference path="hybridCallCard.ts"/>
/// <reference path="hybridManagementCard.ts"/>
/// <reference path="calendarCard.ts"/>
/// <reference path="hybridMediaCard.ts"/>
/// <reference path="hybridContextCard.ts"/>
namespace servicesOverview {

  describe('ServiceOverviewCard', ()=> {

    describe('hybrid cards', ()=> {
      let cards:Array<{card:ServicesOverviewHybridCard,services:Array<string>}>;

      cards = [
        {
          card: new ServicesOverviewHybridCallCard(), services: ['squared-fusion-ec', 'squared-fusion-uc']
        }, {
          card: new ServicesOverviewHybridManagementCard(),
          services: ['squared-fusion-cal', 'squared-fusion-ec', 'squared-fusion-uc', 'squared-fusion-media']
        }, {
          card: new ServicesOverviewCalendarCard(), services: ['squared-fusion-cal']
        }, {
          card: new ServicesOverviewHybridMediaCard(), services: ['squared-fusion-media']
        },
        // {
        //   card: new ServicesOverviewHybridContextCard(), services: ['contact-center-context']
        // }
      ];

      cards.forEach((cardService)=> {
        // describe()
        it(cardService.card.name + ' should set enable if expected service(s) are enabled', ()=> {
          let statuses = _.map(cardService.services, (service)=> {
            return {id: service, status: '', enabled: true}
          });
          cardService.card.hybridStatusEventHandler(statuses);
          expect(cardService.card.active).toBeTruthy();
        });

        it(cardService.card.name + ' should set disable if expected service(s) are disabled', ()=> {
          let statuses = _.map(cardService.services, (service)=> {
            return {id: service, status: '', enabled: false}
          });
          cardService.card.hybridStatusEventHandler(statuses);
          expect(cardService.card.active).toBeFalsy();
        });

        it(cardService.card.name + ' should set disable if one of expected service(s) are disabled', ()=> {
          let enabledFlag = true;
          let statuses = _.map(cardService.services, (service)=> {
            enabledFlag = !enabledFlag;
            return {id: service, status: '', enabled: enabledFlag}
          });
          cardService.card.hybridStatusEventHandler(statuses);
          expect(cardService.card.active).toBeFalsy();
        });

        it(cardService.card.name + ' should set disable no status is received', ()=> {
          let statuses = _.map(cardService.services, (service)=> {
            return {id: service + 'wrong-id', status: '', enabled: true}
          });
          cardService.card.hybridStatusEventHandler(statuses);
          expect(cardService.card.active).toBeFalsy();
        });

        it(cardService.card.name + ' should set status to undefined if no status is received', ()=> {
          let statuses = _.map(cardService.services, (service)=> {
            return {id: service + 'wrong-id', status: 'ok', enabled: true}
          });
          cardService.card.hybridStatusEventHandler(statuses);
          expect(cardService.card.status.status).toEqual(undefined);
        });

        let statuses:any = {
          ok: 'success',
          warn: 'warning',
          error: 'danger',
          disabled: 'disabled',
          undefined: undefined,
          notKnown: undefined
        };

        _.forEach(statuses, (cssExpectedStatus:string, status:string)=> {
          it(cardService.card.name + ' should set status to ' + cssExpectedStatus + ' when ' + status + ' is received', ()=> {
            let statuses = _.map(cardService.services, (service)=> {
              return {id: service, status: status, enabled: true}
            });
            cardService.card.hybridStatusEventHandler(statuses);
            expect(cardService.card.status.status).toEqual(cssExpectedStatus);
          });
        });

        let statusesTxt:any = {
          ok: 'servicesOverview.cardStatus.running',
          warn: 'servicesOverview.cardStatus.alarms',
          error: 'servicesOverview.cardStatus.error',
          disabled: 'servicesOverview.cardStatus.disabled',
          undefined: undefined,
          notKnown: undefined
        };

        _.forEach(statusesTxt, (expectedStatusTxt:string, statusTxt:string)=> {
          it(cardService.card.name + ' should set status text to ' + expectedStatusTxt + ' when ' + statusTxt + ' is received', ()=> {
            let statusesTxt = _.map(cardService.services, (service)=> {
              return {id: service, status: statusTxt, enabled: true}
            });
            cardService.card.hybridStatusEventHandler(statusesTxt);
            expect(cardService.card.status.text).toEqual(expectedStatusTxt);
          });
        });

      });
    });
  });
}
