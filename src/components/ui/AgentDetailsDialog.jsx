import React from 'react';
import { AlertCircle } from 'lucide-react';

const AgentDetailsDialog = ({ open, onOpenChange, agent, onStartChat }) => {
  if (!agent || !open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm'
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className='fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl'>
        <div className='border-4 border-black bg-[#fffff0] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]'>
          {/* Header */}
          <div className='bg-blue-900 text-white px-4 py-2 border-b-4 border-black flex items-center justify-between font-mono'>
            <div className='flex items-center'>
              <AlertCircle className='h-5 w-5 mr-2' />
              AGENT DOSSIER
            </div>
            <div className='text-xs'>REF: {agent?.id?.slice(-8)}</div>
          </div>

          {/* Content */}
          <div className='p-6 space-y-4'>
            <div className='border-2 border-gray-400 bg-gray-100 p-4 font-mono'>
              <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                <div>CALLSIGN:</div>
                <div className='text-blue-900 font-bold'>{agent?.name}</div>

                <div>STATUS:</div>
                <div className='text-green-700'>OPERATIONAL</div>

                <div>CLEARANCE:</div>
                <div className='text-red-700'>
                  {agent?.isPublic ? 'PUBLIC' : 'RESTRICTED'}
                </div>

                <div>CREATED:</div>
                <div>{new Date(agent?.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className='border-2 border-gray-400 bg-gray-100 p-4'>
              <div className='font-mono text-sm mb-2'>
                OPERATIONAL PARAMETERS:
              </div>
              <div className='bg-white p-3 border border-gray-300 font-mono text-sm'>
                {agent?.parameters || 'NO PARAMETERS SPECIFIED'}
              </div>
            </div>

            <div className='border-2 border-yellow-600 bg-yellow-50 p-4 font-mono text-sm'>
              <div className='flex items-start space-x-2'>
                <div className='text-yellow-600 text-xl'>⚠</div>
                <div>
                  NOTICE: Communication with this agent will be logged and
                  monitored in accordance with protocol COMM-7721.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='border-t-2 border-gray-400 p-4 flex justify-end space-x-3'>
            <button
              onClick={() => onOpenChange(false)}
              className='bg-gray-200 px-4 py-2 font-mono text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]'>
              ◄ RETURN
            </button>
            <button
              onClick={onStartChat}
              className='bg-green-700 text-white px-4 py-2 font-mono text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]'>
              INITIATE COMMUNICATION ►
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentDetailsDialog;
