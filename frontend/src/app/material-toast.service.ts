import { Injectable } from '@angular/core';
import { Toast } from '@materializecss/materialize';

@Injectable({ providedIn: 'root' })
export class MaterialToastService {
  show(text: string) {
    Toast.dismissAll();
    const toast = new Toast({
      text,
      displayLength: 3500,
      inDuration: 150,
      outDuration: 150,
      classes: 'app-toast',
    });
    toast.el.setAttribute('role', 'status');
    toast.el.setAttribute('aria-live', 'polite');
  }
}
