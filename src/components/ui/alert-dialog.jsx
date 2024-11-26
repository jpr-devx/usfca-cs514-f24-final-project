import React, { useState, useEffect } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '../../lib/utils';

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn('space-y-2', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const BlinkingText = ({ children, speed = 1000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <span className={visible ? 'opacity-100' : 'opacity-0'}>{children}</span>
  );
};

const WarningPattern = () => (
  <div className='absolute top-0 left-0 w-full h-full -z-10 opacity-10'>
    <div
      className='w-full h-full'
      style={{
        backgroundImage: `repeating-linear-gradient(
        45deg,
        #000,
        #000 10px,
        #ff0 10px,
        #ff0 20px
      )`,
      }}
    />
  </div>
);

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn('flex justify-end space-x-2', className)} {...props} />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-gray-800', className)}
      {...props}
    />
  )
);
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} {...props} />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export default function AlertDialogContent({ children, ...props }) {
  return (
    <div
      className='fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] 
                    w-full max-w-lg border-4 border-black bg-[#fffff0]
                    shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]'
      {...props}>
      {/* Top Warning Banner */}
      <div className='bg-red-700 text-white px-4 py-2 border-b-4 border-black flex items-center justify-between'>
        <BlinkingText speed={800}>⚠ SECURITY ALERT ⚠</BlinkingText>
        <div className='text-xs'>
          REF: {Math.random().toString(36).substr(2, 6).toUpperCase()}
        </div>
      </div>

      {/* Main Content */}
      <div className='relative p-6'>
        <WarningPattern />

        {/* Title */}
        <div className='text-center mb-6'>
          <div className='font-bold text-xl mb-1'>
            !! POSTPONEMENT REQUEST !!
          </div>
          <div className='text-red-700 font-mono text-sm'>
            <BlinkingText speed={600}>
              --- REQUIRES IMMEDIATE ATTENTION ---
            </BlinkingText>
          </div>
        </div>

        {/* Warning Box */}
        <div className='border-2 border-red-700 bg-red-100 p-4 mb-6 font-mono'>
          <div className='flex items-start space-x-2'>
            <div className='text-red-700 text-2xl'>▲</div>
            <div>
              <div className='font-bold text-red-700 mb-2'>
                SECURITY NOTICE:
              </div>
              <div className='text-sm'>
                Postponing mandatory security training may result in:
                <ul className='list-disc ml-4 mt-2 space-y-1'>
                  <li>Restricted system access</li>
                  <li>Mandatory security audit</li>
                  <li>Incident report filed [FORM-1969-B]</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Status Box */}
        <div className='border border-gray-400 bg-gray-100 p-3 mb-6 font-mono text-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              STATUS: <span className='text-red-700'>PENDING</span>
            </div>
            <div>
              CLEARANCE: <span className='text-orange-700'>REVIEW</span>
            </div>
            <div>
              RISK LEVEL: <span className='text-red-700'>ELEVATED</span>
            </div>
            <div>
              OVERRIDE: <BlinkingText>REQUIRED</BlinkingText>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end space-x-3 pt-4 border-t-2 border-gray-400'>
          <button
            className='bg-gray-200 px-4 py-2 font-mono text-sm
                           border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[1px] hover:translate-y-[1px]'>
            ◄ CANCEL REQUEST
          </button>
          <button
            className='bg-red-700 text-white px-4 py-2 font-mono text-sm
                           border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[1px] hover:translate-y-[1px]
                           relative overflow-hidden'>
            <BlinkingText speed={400}>!! CONFIRM OVERRIDE !!</BlinkingText>
          </button>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className='bg-gray-200 border-t-4 border-black px-4 py-2 font-mono text-xs text-center'>
        <BlinkingText speed={1000}>
          UNAUTHORIZED ACCESS OR POSTPONEMENT MAY RESULT IN DISCIPLINARY ACTION
        </BlinkingText>
      </div>
    </div>
  );
}
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
