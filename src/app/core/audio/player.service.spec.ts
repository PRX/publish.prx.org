import { PlayerService } from './player.service';

describe('PlayerService', () => {

  let service = new PlayerService();

  describe('play', () => {

    let player: any;
    beforeEach(() => {
      player = {on: (name, fn) => null, play: () => null, stop: () => null};
      window['AV'] = {Player: {fromFile: () => player, fromURL: () => player}};
    });

    it('plays a file', () => {
      spyOn(player, 'play').and.stub();
      service.play('some-href').subscribe();
      expect(player.play).toHaveBeenCalled();
    });

    it('listens for the duration', () => {
      spyOn(player, 'on').and.callFake((name, fn) => {
        if (name === 'duration') { fn(5000); }
      });
      let data: any;
      let sub = service.play('some-href').subscribe(d => data = d);
      expect(data.duration).toEqual(5000);
      expect(sub.closed).toEqual(false);
    });

    it('follows progress', () => {
      spyOn(player, 'on').and.callFake((name, fn) => {
        if (name === 'progress') { fn(2000); }
      });
      let data: any;
      let sub = service.play('some-href').subscribe(d => data = d);
      expect(data.progress).toEqual(2000);
      expect(sub.closed).toEqual(false);
    });

    it('completes at the end of file', () => {
      spyOn(player, 'on').and.callFake((name, fn) => {
        if (name === 'end') { fn(); }
      });
      let sub = service.play('some-href').subscribe();
      expect(sub.closed).toEqual(true);
    });

    it('stops the player on unsubscribe', () => {
      spyOn(player, 'stop').and.stub();
      let sub = service.play('some-href').subscribe();
      expect(player.stop).not.toHaveBeenCalled();
      sub.unsubscribe();
      expect(player.stop).toHaveBeenCalled();
    });

    it('stops when playing another file', () => {
      spyOn(player, 'stop').and.stub();
      service.play('some-href').subscribe();
      expect(player.stop).not.toHaveBeenCalled();
      service.play('other-href').subscribe();
      expect(player.stop).toHaveBeenCalled();
    });

  });

});
