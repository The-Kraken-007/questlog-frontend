import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreakBadgeComponent } from './streak-badge';

describe('StreakBadgeComponent', () => {
  let component: StreakBadgeComponent;
  let fixture: ComponentFixture<StreakBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreakBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StreakBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Set required input
    component.count = 0;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not be on fire when streak is under 7', () => {
    component.count = 5;
    fixture.detectChanges();
    expect(component.isOnFire).toBe(false);
    
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.streak-badge')?.classList.contains('on-fire')).toBe(false);
  });

  it('should be on fire when streak is 7 or more', () => {
    component.count = 7;
    fixture.detectChanges();
    expect(component.isOnFire).toBe(true);
    
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.streak-badge')?.classList.contains('on-fire')).toBe(true);
  });
});
