import React from 'react';

// Helper to safely mount/unmount components that might cause DOM issues
export function useSafeUnmount<T>(initialValue: T) {
  const [value, setValue] = React.useState<T>(initialValue);
  const isMountedRef = React.useRef(true);
  
  React.useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const setSafeValue = React.useCallback((newValue: T) => {
    if (isMountedRef.current) {
      setValue(newValue);
    }
  }, []);
  
  return [value, setSafeValue] as const;
}

// Wrapper component to prevent DOM errors during unmount
export function SafeRenderWrapper({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    return () => {
      // Cleanup phase - prevent any pending state updates
      setHasError(false);
    };
  }, []);
  
  if (hasError) {
    return React.createElement(React.Fragment, null, fallback);
  }
  
  try {
    return React.createElement(React.Fragment, null, children);
  } catch (error) {
    setHasError(true);
    return React.createElement(React.Fragment, null, fallback);
  }
}

// Example usage to demonstrate proper implementation
export function ExampleComponent() {
  const [data, setData] = useSafeUnmount<string | null>(null);
  
  // eslint-disable-next-line react/no-children-prop
  return React.createElement(SafeRenderWrapper, { 
    children: data ? React.createElement('div', null, data) : React.createElement(React.Fragment, null),
    fallback: React.createElement('div', null, 'Loading...')
  });
}
