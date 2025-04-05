export function getCurrentDateYMD() {
    const now = new Date(Date.now());
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  export const formatTo12Hour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };