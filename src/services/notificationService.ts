import toast from 'react-hot-toast';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser tidak support notifikasi');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Check notification permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, default: false };
  }

  return {
    granted: Notification.permission === 'granted',
    denied: Notification.permission === 'denied',
    default: Notification.permission === 'default',
  };
};

// Send browser notification
export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) {
    console.log('Browser tidak support notifikasi');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

// Send in-app toast notification
export const sendToastNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message, { duration: 4000 });
      break;
    case 'error':
      toast.error(message, { duration: 4000 });
      break;
    default:
      toast(message, { 
        icon: '🔔',
        duration: 4000 
      });
  }
};

// Combined notification (browser + toast)
export const sendNotification = (title: string, message: string, options?: NotificationOptions) => {
  // Send browser notification
  sendBrowserNotification(title, {
    body: message,
    ...options,
  });

  // Also send toast as fallback
  sendToastNotification(`${title}: ${message}`);
};

// Check if task deadline is approaching
export const checkTaskDeadline = (dueDate: string): { isApproaching: boolean; hoursLeft: number } => {
  const now = new Date();
  const deadline = new Date(dueDate);
  const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  return {
    isApproaching: hoursLeft > 0 && hoursLeft <= 24, // Within 24 hours
    hoursLeft: Math.round(hoursLeft),
  };
};

// Check if it's bedtime
export const checkBedtime = (targetBedTime: string): boolean => {
  const now = new Date();
  const [hours, minutes] = targetBedTime.split(':').map(Number);
  
  const bedtime = new Date();
  bedtime.setHours(hours, minutes, 0, 0);

  // Check if within 30 minutes of bedtime
  const diff = bedtime.getTime() - now.getTime();
  const minutesDiff = diff / (1000 * 60);

  return minutesDiff >= 0 && minutesDiff <= 30;
};

// Format time remaining
export const formatTimeRemaining = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} menit lagi`;
  } else if (hours < 24) {
    return `${Math.round(hours)} jam lagi`;
  } else {
    const days = Math.round(hours / 24);
    return `${days} hari lagi`;
  }
};
