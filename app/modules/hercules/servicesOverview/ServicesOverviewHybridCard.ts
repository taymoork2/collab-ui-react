/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {
  export abstract class ServicesOverviewHybridCard extends ServicesOverviewCard {
    abstract hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>):void;
  }
}
