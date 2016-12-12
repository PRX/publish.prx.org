import { ProseMirrorMarkdownEditor } from './prosemirror.markdown.editor';
import { ElementRef } from '@angular/core';

describe('ProseMirrorMarkdownEditor', () => {
  let el;

  beforeEach(function () {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(function () {
    document.body.removeChild(el);
    el = null;
  });

  function createProseMirrorMarkdownEditor() {
    return new ProseMirrorMarkdownEditor(new ElementRef(el), '', [], () => {}, () => {});
  }

  describe('constructor', () => {
    it('should save initial state', () => {
      let pmEditor = createProseMirrorMarkdownEditor();
      expect(pmEditor.savedState).toBeDefined();
    });

    it('should create MenuBarEditorView', () => {
      let pmEditor = createProseMirrorMarkdownEditor();
      expect(pmEditor.view).toBeDefined();
    });
  });

  describe('update', () => {
    let pmEditor;

    beforeEach(function () {
      pmEditor = createProseMirrorMarkdownEditor();
    });

    afterEach(function () {
      pmEditor.destroy();
    });

    it('should update view', () => {
      spyOn(pmEditor.view, 'update');
      pmEditor.update([]);
      expect(pmEditor.view.update).toHaveBeenCalled();
    });
  });

  describe('resetEditor', () => {
    let pmEditor;
    let savedState;

    beforeEach(function () {
      pmEditor = createProseMirrorMarkdownEditor();
      savedState = pmEditor.savedState;
    });

    afterEach(function () {
      pmEditor.destroy();
    });

    it('should update view state', () => {
      spyOn(pmEditor.view, 'updateState');
      pmEditor.resetEditor();
      expect(pmEditor.view.updateState).toHaveBeenCalledWith(savedState);
    });
  });
});
