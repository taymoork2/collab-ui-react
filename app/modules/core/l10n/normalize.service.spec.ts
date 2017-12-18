import { NormalizeHelper } from './normalize.helper';

describe('Service: NormalizeService', function () {
  it('Should strip accents from characters', function () {
    expect(
      NormalizeHelper.stripAccents('ÁĂẮẶẰẲẴǍÂẤẬẦẨẪÄǞȦǠẠȀÀẢȂĀĄÅǺḀÃḂḄḆĆČÇḈĈĊĎḐḒḊḌḎÉĔĚȨḜÊẾỆỀỂỄḘËĖẸȄÈẺȆĒḖḔĘẼḚḞǴĞǦĢĜĠḠḪȞḨĤḦḢḤÍĬǏÎÏḮİỊȈÌỈȊĪĮĨḬĴḰǨĶḲḴĹĽĻḼḶḸḺḾṀṂŃŇŅṊṄṆǸṈÑÓŎǑÔỐỘỒỔỖÖȪȮȰỌŐȌÒỎƠỚỢỜỞỠȎŌṒṐǪǬÕṌṎȬṔṖŔŘŖṘṚṜȐȒṞŚṤŠṦŞŜȘṠṢṨŤŢṰȚṪṬṮÚŬǓÛṶÜǗǙǛǕṲỤŰȔÙỦƯỨỰỪỬỮȖŪṺŲŮŨṸṴẂŴẄẆẈẀẌẊÝŶŸẎỴỲƳỶȲỸŹŽẐŻẒẔáăắặằẳẵǎâấậầẩẫäǟȧǡạȁàảȃāąåǻḁãḃḅḇćčçḉĉċďḑḓḋḍḏéĕěȩḝêếệềểễḙëėẹȅèẻȇēḗḕęẽḛḟǵğǧģĝġḡḫȟḩĥḧḣḥẖíĭǐîïḯịȉìỉȋīįĩḭǰĵḱǩķḳḵĺľļḽḷḹḻḿṁṃńňņṋṅṇǹṉñóŏǒôốộồổỗöȫȯȱọőȍòỏơớợờởỡȏōṓṑǫǭõṍṏȭṕṗŕřŗṙṛṝȑȓṟśṥšṧşŝșṡṣṩťţṱțẗṫṭṯúŭǔûṷüǘǚǜǖṳụűȕùủưứựừửữȗūṻųůũṹṵṽẃŵẅẇẉẁẘẍẋýŷÿẏỵỳƴỷȳẙỹźžẑżẓẕ'))
      .toBe('AAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBCCCCCCDDDDDDEEEEEEEEEEEEEEEEEEEEEEEEEFGGGGGGGHHHHHHHIIIIIIIIIIIIIIIIJKKKKKLLLLLLLMMMNNNNNNNNNOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOPPRRRRRRRRRSSSSSSSSSSTTTTTTTUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUWWWWWWXXYYYYYYƳYYYZZZZZZaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbccccccddddddeeeeeeeeeeeeeeeeeeeeeeeeefggggggghhhhhhhhiiiiiiiiiiiiiiijjkkkkklllllllmmmnnnnnnnnnoooooooooooooooooooooooooooooooooopprrrrrrrrrssssssssssttttttttuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuvwwwwwwwxxyyyyyyƴyyyyzzzzzz');
  });

  it('Leaves characters that are its own letter intact', function () {
    expect(
      NormalizeHelper.stripAccents('ŒØÆœøæij'))
      .toBe('ŒØÆœøæij');
  });
});
