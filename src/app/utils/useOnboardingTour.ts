import { driver } from 'driver.js';
import 'driver.js/dist/driver.css'; // Ensure driver CSS is imported

export function useOnboardingTour() {
  const startTour = (force = false) => {
    const hasSeenTour = localStorage.getItem('knoxite_onboarding_completed');
    if (hasSeenTour && !force) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true, // Allows user to exit the tour anytime
      overlayOpacity: 0.45,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: 'knoxite-tap-popover',
      onDestroyStarted: () => {
        localStorage.setItem('knoxite_onboarding_completed', 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: '#tour-knoxhub',
          popover: {
            title: 'KnoxHub',
            description: 'Browse active skill exchange requests across campus.',
            side: 'right',
            align: 'center',
            showButtons: ['next', 'close'],
          },
        },
        {
          element: '#tour-my-skills',
          popover: {
            title: 'My Skills',
            description: 'Manage your offered and requested skills.',
            side: 'right',
            align: 'center',
            showButtons: ['next', 'previous', 'close'],
          },
        },
        {
          element: '#tour-community-forum',
          popover: {
            title: 'Community Forum',
            description: 'Explore community discussions and forum posts.',
            side: 'right',
            align: 'center',
            showButtons: ['next', 'previous', 'close'],
          },
        },
        {
          element: '#tour-leaderboard',
          popover: {
            title: 'Leaderboard',
            description: 'View top mentors and most active users.',
            side: 'right',
            align: 'center',
            showButtons: ['next', 'previous', 'close'],
          },
        },
        {
          element: '#tour-nav-messages',
          popover: {
            title: 'Messages',
            description: 'Access your chats and direct skill discussions.',
            side: 'bottom',
            align: 'end',
            showButtons: ['next', 'previous', 'close'],
          },
        },
        {
          element: '#tour-nav-notifications',
          popover: {
            title: 'Notifications',
            description: 'Stay updated on swap requests and activity alerts.',
            side: 'bottom',
            align: 'end',
            showButtons: ['next', 'previous', 'close'],
          },
        },
        {
          element: '#tour-nav-profile',
          popover: {
            title: 'Profile Menu',
            description: 'Manage your account settings, profile, and display preferences.',
            side: 'bottom',
            align: 'end',
            showButtons: ['next', 'previous', 'close'],
          },
        },
      ],
    });

    // Small delay ensures dashboard/navbar DOM elements are mounted before tour starts
    setTimeout(() => {
      driverObj.drive();
    }, 300);
  };

  return { startTour };
}