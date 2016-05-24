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
        //hybrid call will be enabled either if one of the dependent services are enabled.
        {
          card: new ServicesOverviewHybridCallCard(),
          services: ['squared-fusion-uc']
        },
        // management card depends on state on multiple services:
        {
          card: new ServicesOverviewHybridManagementCard(),
          services: ['squared-fusion-mgmt', 'squared-fusion-cal']
        }, {
          card: new ServicesOverviewHybridManagementCard(),
          services: ['squared-fusion-mgmt', 'squared-fusion-uc']
        }, {
          card: new ServicesOverviewHybridManagementCard(),
          services: ['squared-fusion-mgmt', 'squared-fusion-media']
        }, {
          card: new ServicesOverviewCalendarCard(),
          services: ['squared-fusion-cal']
        }, {
          card: new ServicesOverviewHybridMediaCard(),
          services: ['squared-fusion-media']
        }
      ];
      let allServices:Array<string> = ['squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-cal', 'squared-fusion-media', 'squared-fusion-mgmt'];

      cards.forEach((cardService)=> {
        describe('' + cardService.card.name, ()=> {
          it('should set enable if expected service(s) are enabled', ()=> {
            let statuses = _.map(cardService.services, (service)=> {
              return {id: service, status: '', enabled: true};
            });
            cardService.card.hybridStatusEventHandler(statuses);
            expect(cardService.card.active).toBeTruthy();
          });

          it('should set disable if expected service(s) are disabled', ()=> {
            let statuses = _.map(cardService.services, (service)=> {
              return {id: service, status: '', enabled: false};
            });
            cardService.card.hybridStatusEventHandler(statuses);
            expect(cardService.card.active).toBeFalsy();
          });




          if (cardService.card.name !== 'servicesOverview.cards.hybridManagement.title') {
            //not applicable to mgmt card
            it('should set disable if one of expected service(s) are disabled', ()=> {
              let enabledFlag = true;
              let statuses = _.map(cardService.services, (service)=> {
                enabledFlag = !enabledFlag;
                return {id: service, status: '', enabled: enabledFlag}
              });
              cardService.card.hybridStatusEventHandler(statuses);
              expect(cardService.card.active).toBeFalsy();
            });

            it('should set disable if no status from expected services and unexpected services are enabled', ()=> {
              let statuses = _.chain(allServices).difference(cardService.services).map((service)=> {
                return {id: service, status: '', enabled: true};
              }).value();
              cardService.card.hybridStatusEventHandler(statuses);
              expect(cardService.card.active).toBeFalsy();
            });

            it('should set disable if expected service are disabled and unexpected services are enabled', ()=> {
              let statuses = _.chain(allServices).difference(cardService.services).map((service)=> {
                return {id: service, status: '', enabled: true}
              }).concat(_.map(cardService.services, (service)=> {
                return {id: service, status: '', enabled: false};
              })).value();
              cardService.card.hybridStatusEventHandler(statuses);
              expect(cardService.card.active).toBeFalsy();
            });
          }

          it('should set disable no status is received', ()=> {
            let statuses = _.map(cardService.services, (service)=> {
              return {id: service + 'wrong-id', status: '', enabled: true}
            });
            cardService.card.hybridStatusEventHandler(statuses);
            expect(cardService.card.active).toBeFalsy();
          });

          it('should set status to undefined if no status is received', ()=> {
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
            it('should set status to ' + cssExpectedStatus + ' when ' + status + ' is received', ()=> {
              let stats = _.map(cardService.services, (service)=> {
                return {id: service, status: status, enabled: true}
              });
              let tempCard = angular.copy(cardService.card);
              tempCard.hybridStatusEventHandler(stats);
              expect(tempCard.status.status).toEqual(cssExpectedStatus);
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
            it('should set status text to ' + expectedStatusTxt + ' when ' + statusTxt + ' is received', ()=> {
              let stats = _.map(cardService.services, (service)=> {
                return {id: service, status: statusTxt, enabled: true}
              });
              cardService.card.hybridStatusEventHandler(stats);
              expect(cardService.card.status.text).toEqual(expectedStatusTxt);
            });
          });
        });
      });
    });
  });
}
