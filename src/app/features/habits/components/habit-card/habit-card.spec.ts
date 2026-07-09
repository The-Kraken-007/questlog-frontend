import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitCardComponent } from './habit-card';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HabitCardComponent', () => {
  let component: HabitCardComponent;
  let fixture: ComponentFixture<HabitCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HabitCardComponent);
    component = fixture.componentInstance;
    
    // Provide a dummy habit so template doesn't crash on undefined
    component.habit = {
      id: 1,
      name: 'Read a book',
      emoji: '📚',
      isCompletedToday: false,
      currentStreak: 2,
      isArchived: false,
      sortOrder: 1,
      createdAt: new Date().toISOString()
    };
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the habit name and emoji', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h3')?.textContent).toContain('Read a book');
    expect(el.querySelector('.emoji')?.textContent).toContain('📚');
  });

  it('should toggle expand state when header is clicked', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.card-header') as HTMLElement;
    
    expect(component.isExpanded()).toBe(false);
    
    header.click();
    expect(component.isExpanded()).toBe(true);
  });
});
