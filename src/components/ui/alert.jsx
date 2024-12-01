import * as React from 'react';
import { cn } from '../../lib/utils';

const Alert = React.forwardRef(
  (
    { variant = 'default', className, onComplete, onPostpone, ...props },
    ref
  ) => {
    const variantStyles = {
      default: 'border-2 border-gray-700 bg-[#f0f0f0]',
      warning: 'border-2 border-red-700 bg-yellow-100',
      error: 'border-2 border-red-700 bg-red-100',
      success: 'border-2 border-green-700 bg-green-100',
    };

    return (
      <div
        ref={ref}
        role='alert'
        className={cn(
          "relative w-full p-0 font-['Courier_New'] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-blue-900 text-white p-2 font-['Courier_New'] text-center mb-0 text-sm font-bold",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-3 text-sm font-mono [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

const AlertFooter = React.forwardRef(
  ({ className, onComplete, onPostpone, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'border-t-2 border-gray-400 bg-gray-100 p-3 flex justify-end space-x-2',
        className
      )}
      {...props}>
      <button
        onClick={onComplete}
        className="bg-green-700 text-white px-4 py-2 text-xs font-['Courier_New']
                border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[1px] hover:translate-y-[1px]
                active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
        【 TRAINING COMPLETED 】
      </button>
      <button
        onClick={onPostpone}
        className="bg-gray-300 px-4 py-2 text-xs font-['Courier_New']
                border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[1px] hover:translate-y-[1px]
                active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
        【 WILL COMPLETE NEXT YEAR 】
      </button>
    </div>
  )
);
AlertFooter.displayName = 'AlertFooter';

export { Alert, AlertTitle, AlertDescription, AlertFooter };
