import Image from 'next/image';
import React from 'react';

export const ConfirmedStamp: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', size = 'md' }) => {
  // Size mapping for responsive design
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-24 h-24 sm:w-28 sm:h-28'
  };

  return (
    <div 
      className={`absolute z-20 ${className}`}
      style={{
        top: '0.75rem',
        right: '0.75rem',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        transformOrigin: 'center'
      }}
    >
      <div className="animate-appear">
        <Image
          src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1738243649/Spectrum/main-icons-2025/confirmed_bomsfc.webp"
          alt="Confirmed"
          width={100}
          height={100}
          className={`${sizeClasses[size]} object-contain transform rotate-[-15deg] transition-transform hover:rotate-[-5deg] duration-300`}
          priority={true}
        />
      </div>
    </div>
  );
};
