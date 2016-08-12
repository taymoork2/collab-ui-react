import { ServicesOverviewCareCard } from './careCard';

describe('ServicesOverviewCareCard', ()=> {

  let careCard:ServicesOverviewCareCard;
  beforeEach(()=> {
    careCard = new ServicesOverviewCareCard({
      isAllowedState: ()=> {
        return true;
      }
    });
  });

  it('should get button list', ()=> {
    var buttons = careCard.getButtons();
    expect(buttons.length).toEqual(2);
    expect(buttons[0].name).toMatch("features");
    expect(buttons[1].name).toMatch("settings");
  });
});
