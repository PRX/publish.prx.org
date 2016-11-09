import { Directive, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DragulaService, DragulaDirective } from 'ng2-dragula/ng2-dragula';
import { UUID } from '../../core';
import { AudioVersionModel } from '../../shared';

@Directive({
  selector: '[publishFreeReorder]'
})
export class FreeReorderDirective extends DragulaDirective implements OnInit, OnDestroy {

  @Input() publishFreeReorder: AudioVersionModel;

  private dragSub: Subscription;

  constructor(el: ElementRef, private myDragula: DragulaService) {
    super(el, myDragula);
  }

  ngOnInit() {
    this.bag = UUID.UUID();
    this.dragulaModel = this.publishFreeReorder.files;
    this.myDragula.setOptions(this.bag, {
      moves: (el: Element, source: Element, handle: Element) => {
        return handle.classList.contains('drag-handle');
      }
    });
    this.dragSub = this.myDragula.dropModel.subscribe(() => {
      this.publishFreeReorder.refreshPositions();
    });
    super.ngOnInit();
  }

  ngOnDestroy() {
    if (this.dragSub) {
      this.dragSub.unsubscribe();
    }
  }

}
