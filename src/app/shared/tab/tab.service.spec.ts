import { TabService } from './tab.service';

describe('TabService', () => {

  let tab = new TabService();

  it('emits the current model', () => {
    let currentModel: any = 'nothing';
    tab.model.subscribe(model => currentModel = model);
    expect(currentModel).toEqual('nothing');
    tab.setModel(<any> 'something');
    expect(currentModel).toEqual('something');
  });

  it('replays the last model', () => {
    let mod1: any = 'nothing', mod2: any = 'nothing';
    tab.model.subscribe(model => mod1 = model);

    tab.setModel(<any> 'something');
    expect(mod1).toEqual('something');
    expect(mod2).toEqual('nothing');

    tab.model.subscribe(model => mod2 = model);
    expect(mod2).toEqual('something');
  });

});
