import { Check } from "lucide-react";
import { Fragment } from "react";

interface Props {
  currentStep: number;
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 4 }: Props) {
  const steps = [
    { id: 1, label: "Contact" },
    { id: 2, label: "Brief" },
    { id: 3, label: "Project" },
    { id: 4, label: "Meeting" }
  ];

  return (
    <div className="w-full mb-12 sm:mb-10 px-2 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300
                    ${isCompleted ? 'bg-yellow text-navy shadow-[0_0_15px_rgba(255,238,52,0.4)]' : 
                      isActive ? 'bg-transparent border-2 border-yellow text-yellow shadow-[0_0_15px_rgba(255,238,52,0.3)]' : 
                      'bg-white/5 border border-white/10 text-white/30'}`}
                >
                  {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.id}
                </div>
                <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest absolute -bottom-6 sm:-bottom-6 whitespace-nowrap transition-colors hidden xs:block sm:block
                  ${isActive || isCompleted ? 'text-yellow/80' : 'text-white/30'}`}>
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 sm:mx-4 bg-white/10 rounded-full overflow-hidden relative min-w-[10px]">
                  <div 
                    className="absolute top-0 left-0 h-full bg-yellow transition-all duration-500"
                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
