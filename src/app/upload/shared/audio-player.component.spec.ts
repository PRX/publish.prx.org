import { cit, create, provide, By } from '../../../testing';
import { Subject } from 'rxjs';
import { PlayerService } from '../../core/audio/player.service';
import { AudioPlayerComponent } from './audio-player.component';

describe('AudioPlayerComponent', () => {

  create(AudioPlayerComponent);

  provide(PlayerService, {play: () => {
    return {subscribe: () => null};
  }});

  cit('shows errors', (fix, el, comp) => {
    comp.error = 'Some error message';
    fix.detectChanges();
    expect(el).toContainText('Some error message');
  });

  cit('plays a file', (fix, el, comp) => {
    spyOn(comp.player, 'play').and.callThrough();
    comp.file = {upload: {file: 'some-file'}};
    expect(el).toQuery('button.play');
    el.query(By.css('button.play')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('button.pause');
    expect(comp.player.play).toHaveBeenCalledWith('some-file');
  });

  cit('plays a url', (fix, el, comp) => {
    spyOn(comp.player, 'play').and.callThrough();
    comp.file = {enclosureHref: 'some-href'};
    expect(el).toQuery('button.play');
    el.query(By.css('button.play')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('button.pause');
    expect(comp.player.play).toHaveBeenCalledWith('some-href');
  });

  cit('shows progress', (fix, el, comp) => {
    let data = new Subject<any>();
    spyOn(comp.player, 'play').and.returnValue(data);
    comp.file = {enclosureHref: 'some-href'};
    comp.play();
    expect(comp.progress).toEqual(0);
    expect(comp.playing).toEqual(true);
    data.next({duration: 10, progress: 5});
    expect(comp.progress).toEqual(0.5);
    data.complete();
    expect(comp.progress).toEqual(0);
    expect(comp.playing).toEqual(false);
  });

  cit('stops playing', (fix, el, comp) => {
    comp.playing = true;
    comp.progress = 0.8;
    comp.stop();
    expect(comp.progress).toEqual(0);
    expect(comp.playing).toEqual(false);
  });

  cit('proxies cms public asset urls', (fix, el, comp) => {
    spyOn(comp.player, 'play').and.callThrough();
    comp.file = {enclosureHref: 'http://cms-something/pub/some-href'};
    el.query(By.css('button.play')).nativeElement.click();
    fix.detectChanges();
    expect(el).toQuery('button.pause');
    expect(comp.player.play).toHaveBeenCalledWith(`${window.location.origin}/pub/some-href`);
  });

});
