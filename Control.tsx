import { playSound } from '@/lib/game-audio';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
export const Control = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Control({ className = '', type = 'button', onClick, ...props }, ref) {
  return <button ref={ref} type={type} className={`control ${className}`} {...props} onClick={event => { playSound('ui'); onClick?.(event); }} />;
});
