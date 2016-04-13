namespace servicesLanding {

  // export interface filter {
  //   label:String;
  //   columns:Array<filterColumn>;
  //   columnDefs?:Array<any>;
  // }
  //
  // export interface filterColumn {
  //   label:String;
  //   valueFunction(row):Number;
  // }

  export interface CardButton {
    name:String;
    class?:String;
    link:String;
  }

  export class ServicesLandingCard {

    get template() {
      return this._template;
    }

    get name() {
      return this._name;
    }

    get description() {
      return this._description;
    }

    get cardClass() {
      return this._cardClass;
    }

    get icon() {
      return this._icon;
    }

    get active() {
      return this._active;
    }

    get buttons() {
      return this._buttons;
    }

    public constructor(private _template:String, private _name:String, private _description, private _icon:String, private _buttons:Array<CardButton>, private _active:boolean = true, private _cardClass:String = 'cs-card') {

    }
  }

}
