import React from 'react';
import './StepIndicator.css';

const STEPS = [
  { number: 1, label: 'Shablon & raqam' },
  { number: 2, label: 'Xodim F.I.O.' },
  { number: 3, label: 'Kasb va davomiyligi' },
  { number: 4, label: "Direktor & ro'yxat" },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator">
      {STEPS.map((step, idx) => {
        const state =
          step.number < currentStep ? 'done' :
          step.number === currentStep ? 'active' : 'pending';
        return (
          <React.Fragment key={step.number}>
            <div className={`step-item step-${state}`}>
              <div className="step-circle">
                {state === 'done' ? '✓' : step.number}
              </div>
              <div className="step-meta">
                <span className="step-num">Bo'lim {step.number}</span>
                <span className="step-label">{step.label}</span>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`step-line ${step.number < currentStep ? 'step-line-done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}