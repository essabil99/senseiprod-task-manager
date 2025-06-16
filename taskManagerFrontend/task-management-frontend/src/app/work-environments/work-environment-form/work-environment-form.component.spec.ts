import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkEnvironmentFormComponent } from './work-environment-form.component';

describe('WorkEnvironmentFormComponent', () => {
  let component: WorkEnvironmentFormComponent;
  let fixture: ComponentFixture<WorkEnvironmentFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkEnvironmentFormComponent]
    });
    fixture = TestBed.createComponent(WorkEnvironmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
