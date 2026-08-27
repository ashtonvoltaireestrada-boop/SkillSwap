import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useOnboardingTour() {
  const startTour = (force = false) => {
    const hasSeenTour = localStorage.getItem('knoxite_onboarding_completed');
    if (hasSeenTour && !force) return;

    let driverObj: any;

    const attachStepClick = (elementSelector: string) => {
      setTimeout(() => {
        const el = document.querySelector(elementSelector);
        if (el) {
          const handler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            el.removeEventListener('click', handler, true);
            driverObj.moveNext();
          };
          el.addEventListener('click', handler, true);
        }
      }, 50);
    };

    driverObj = driver({
      showProgress: false,
      animate: true,
      allowClose: false,
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
          element: '#tour-community-forum',
          popover: {
            title: 'Explore community discussions and forum posts.',
            description: 'Please click the button to continue',
            side: 'right',
            align: 'center',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-community-forum'),
        },
        {
          element: '#tour-knoxhub',
          popover: {
            title: 'Browse active skill exchange requests across campus.',
            description: 'Please click the button to continue.',
            side: 'right',
            align: 'center',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-knoxhub'),
        },
        {
          element: '#tour-leaderboard',
          popover: {
            title: 'View top contributors and milestones.',
            description: 'Please click the button to continue.',
            side: 'right',
            align: 'center',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-leaderboard'),
        },
        {
          element: '#tour-my-skills',
          popover: {
            title: 'Manage your offered and requested skills.',
            description: 'Please click the button to continue',
            side: 'right',
            align: 'center',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-my-skills'),
        },
        {
          element: '#tour-nav-messages',
          popover: {
            title: 'Access your chats and direct skill discussions.',
            description: 'Please click the button to continue',
            side: 'bottom',
            align: 'end',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-nav-messages'),
        },
        {
          element: '#tour-nav-notifications',
          popover: {
            title: 'Stay updated on swap requests and activity alerts.',
            description: 'Please click the button to continue',
            side: 'bottom',
            align: 'end',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-nav-notifications'),
        },
        {
          element: '#tour-nav-profile',
          popover: {
            title: 'Manage your account settings, profile, and credentials.',
            description: 'Please click the button to finish',
            side: 'bottom',
            align: 'end',
            showButtons: [],
          },
          onHighlightStarted: () => attachStepClick('#tour-nav-profile'),
        },
      ],
    });

    driverObj.drive();
  };

  return { startTour };
}