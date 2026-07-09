import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.percent = 50;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set the fill width equal to percent', () => {
    component.percent = 75;
    fixture.detectChanges();

    const fill = fixture.nativeElement.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('75%');
  });

  it('should display the percentage label', () => {
    component.percent = 40;
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.progress-label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('40%');
  });
});
