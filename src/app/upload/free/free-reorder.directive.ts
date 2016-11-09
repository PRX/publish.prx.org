import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragulaService, DragulaDirective } from 'ng2-dragula/ng2-dragula';
import { UUID } from '../../core';
import { AudioFileModel } from '../../shared';

@Directive({
  selector: '[publishFreeReorder]'
})
export class FreeReorderDirective extends DragulaDirective implements OnInit, OnDestroy {

  @Input() publishFreeReorder: AudioFileModel[];

  private dragSub: Subscription;

  constructor(el: ElementRef, private myDragula: DragulaService) {
    super(el, myDragula);
  }

  ngOnInit() {
    this.bag = UUID.UUID();
    this.dragulaModel = this.publishFreeReorder;
    this.myDragula.setOptions(this.bag, {
      moves: (el: Element, source: Element, handle: Element) => {
        return handle.classList.contains('drag-handle');
      }
    });
    this.dragSub = this.myDragula.dropModel.subscribe(() => this.reposition());
    super.ngOnInit();
  }

  ngOnDestroy() {
    if (this.dragSub) {
      this.dragSub.unsubscribe();
    }
  }

  reposition() {
    let position = 1;
    this.publishFreeReorder.forEach(file => {
      if (!file.isDestroy) {
        this.setPosition(file, position++);
      }
    });
  }

  setPosition(file: AudioFileModel, position: number) {
    file.set('position', position);
    if (this.usesDefaultLabels) {
      let segLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(position - 1) % 26];
      file.set('label', `Segment ${segLetter}`);
    }
  }

  get usesDefaultLabels(): boolean {
    return this.publishFreeReorder.every(f => f.label.match(/Segment [A-Z]/) ? true : false);
  }

}
