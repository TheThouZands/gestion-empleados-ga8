import { TestBed } from '@angular/core/testing';
import { MaterialToastService } from './material-toast.service';

const { create, dismissAll } = vi.hoisted(() => ({ create: vi.fn(), dismissAll: vi.fn() }));
vi.mock('@materializecss/materialize', () => ({
  Toast: class {
    static dismissAll = dismissAll;
    el = document.createElement('div');
    constructor(options: unknown) {
      create(options, this.el);
    }
  },
}));

describe('MaterialToastService', () => {
  beforeEach(() => {
    create.mockClear();
    dismissAll.mockClear();
  });
  it('uses the Materialize toast with a short dismissal time', () => {
    TestBed.inject(MaterialToastService).show('Empleado guardado.');
    expect(create.mock.calls[0][0]).toMatchObject({
      text: 'Empleado guardado.',
      displayLength: 3500,
      classes: 'app-toast',
    });
  });
  it('sets polite accessible feedback', () => {
    TestBed.inject(MaterialToastService).show('Empleado eliminado.');
    const element = create.mock.calls[0][1] as HTMLElement;
    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-live')).toBe('polite');
  });
  it('dismisses the previous notification before creating another', () => {
    const service = TestBed.inject(MaterialToastService);
    service.show('Uno');
    service.show('Dos');
    expect(dismissAll).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledTimes(2);
  });
});
