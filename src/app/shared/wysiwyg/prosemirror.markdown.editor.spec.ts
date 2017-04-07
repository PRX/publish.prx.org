import { ProseMirrorMarkdownEditor, ProseMirrorFormatTypes } from './prosemirror.markdown.editor';
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
    return new ProseMirrorMarkdownEditor(new ElementRef(el), '', ProseMirrorFormatTypes.MARKDOWN, ProseMirrorFormatTypes.MARKDOWN,
      true, [], () => {}, () => {}, () => {});
  }

  describe('constructor', () => {
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

    it('should update view when value changes', () => {
      spyOn(pmEditor.view, 'update');
      pmEditor.update('');
      expect(pmEditor.view.update).not.toHaveBeenCalled();
      pmEditor.update('foo');
      expect(pmEditor.view.update).toHaveBeenCalled();
    });

    it('should update view when images are passed', () => {
      spyOn(pmEditor.view, 'update');
      pmEditor.update('');
      expect(pmEditor.view.update).not.toHaveBeenCalled();
      pmEditor.update('', []);
      expect(pmEditor.view.update).toHaveBeenCalled();
    });
  });
});
