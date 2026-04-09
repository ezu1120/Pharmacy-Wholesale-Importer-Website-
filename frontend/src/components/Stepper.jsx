const STEPS = ['Contact', 'Products', 'Logistics', 'Review']

export default function Stepper({ currentStep }) {
  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-primary flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
            {currentStep}
          </span>
          Step {currentStep}: {STEPS[currentStep - 1]}
        </span>
        <span className="text-sm font-medium text-on-surface-variant">
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="grid grid-cols-4 mt-3 text-[11px] font-bold text-outline uppercase tracking-wider">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`${i === 0 ? 'text-left' : i === STEPS.length - 1 ? 'text-right' : 'text-center'} ${
              i + 1 <= currentStep ? 'text-primary' : ''
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
