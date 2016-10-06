import { ServicesOverviewCareCard } from './careCard';

describe('ServicesOverviewCareCard', () => {

  let careCard: ServicesOverviewCareCard;
  beforeEach(() => {
    careCard = new ServicesOverviewCareCard({
      isAllowedState: () => {
        return true;
      },
    });
  });

  it('should get button list', () => {
    let buttons = careCard.getButtons();
    expect(buttons.length).toEqual(1);
    expect(buttons[0].name).toMatch('features');
  });
});
