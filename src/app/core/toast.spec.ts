import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast and start with empty list', () => {
    expect(service.toasts()).toEqual([]);
    service.info('Hello!');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Hello!');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should use correct type for success and error helpers', () => {
    service.success('Done!');
    service.error('Oops!');
    const toasts = service.toasts();
    expect(toasts[0].type).toBe('success');
    expect(toasts[1].type).toBe('error');
  });

  it('should dismiss a toast by id', () => {
    service.info('One');
    service.info('Two');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Two');
  });
});
