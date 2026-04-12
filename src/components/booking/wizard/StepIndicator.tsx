import { Check } from "lucide-react";

interface Props {
  currentStep: number;
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 3 }: Props) {
  const steps = [
    { id: 1, label: "Contact" },
    { id: 2, label: "Brief" },
    { id: 3, label: "Meeting" }
  ];

  return (
    <div className="w-full flex items-center justify-center mb-10">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10
                  ${isCompleted ? 'bg-yellow text-navy shadow-[0_0_15px_rgba(255,238,52,0.4)]' : 
                    isActive ? 'bg-transparent border-2 border-yellow text-yellow shadow-[0_0_15px_rgba(255,238,52,0.3)]' : 
                    'bg-white/5 border border-white/10 text-white/30'}`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-[10px] uppercase tracking-widest mt-2 absolute -bottom-5 whitespace-nowrap transition-colors
                ${isActive || isCompleted ? 'text-yellow/80' : 'text-white/30'}`}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="w-16 sm:w-24 md:w-32 h-1 mx-2 bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-yellow transition-all duration-500"
                  style={{ width: currentStep > step.id ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
