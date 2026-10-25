import { createBrowserRouter, Navigate } from "react-router";

import PreviewPage from "@/app/pages/PreviewPage";
import LoginPage from "@/app/pages/LoginPage";
import SignupPage from "@/app/pages/SignupPage";
import DashboardPage from "@/app/pages/DashboardPage";
import ProfilePage from "@/app/pages/ProfilePage";
import ChatPage from "@/app/pages/ChatPage";
import SwapAgreementPage from "@/app/pages/SwapAgreementPage";  
import ReputationPage from "@/app/pages/ReputationPage";
import AdminDashboardPage from "@/app/pages/AdminDashboardPage";
import KnoxHubPage from "@/app/pages/KnoxHubPage";
import CalendarPage from "@/app/pages/CalendarPage";
import PrivacyPolicyPage from "@/app/pages/PrivacyPolicyPage";
import SecurityPage from "@/app/pages/SecurityPage";
import ReportUserPage from "@/app/pages/ReportUserPage";
import LeaderboardPage from "@/app/pages/LeaderboardPage";
import AchievementsPage from "@/app/pages/AchievementsPage";
import CommunityForumPage from "@/app/pages/CommunityForumPage";
import PostDetailsPage from "@/app/pages/PostDetailsPage";
import NotificationPage from "@/app/pages/NotificationPage";
import AnalyticsPage from "@/app/pages/AnalyticsPage";
import ActivityTimelinePage from "@/app/pages/ActivityTimelinePage";
import MySkillsPage from "@/app/pages/MySkillsPage";
import SwapDetailsPage from "@/app/pages/SwapDetailsPage"; 

// 1. Guard for Admin-only areas (Sends regular users back to student dashboard)
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userString = localStorage.getItem("knoxite_user");
  
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user.role === "ADMIN") {
        return <>{children}</>;
      }
    } catch (e) {
      console.error("Error reading user data", e);
    }
  }
  
  return <Navigate to="/dashboard" replace />;
};

// 2. Guard for Student-only areas (Bounces admins over to the admin command center)
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const userString = localStorage.getItem("knoxite_user");
  
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user.role === "ADMIN") {
        return <Navigate to="/admin-dashboard" replace />;
      }
    } catch (e) {
      console.error("Error reading user data", e);
    }
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PreviewPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  // Protected Student Routes (Admins are blocked from swap workflows)
  {
    path: "/dashboard",
    element: <StudentRoute><DashboardPage /></StudentRoute>,
  },
  {
    path: "/my-skills",
    element: <StudentRoute><MySkillsPage /></StudentRoute>,
  },
  {
    path: "/chat",
    element: <StudentRoute><ChatPage /></StudentRoute>,
  },
  {
    path: "/knox-hub",
    element: <StudentRoute><KnoxHubPage /></StudentRoute>,
  },
  {
    path: "/swap-agreement/:swapId",
    element: <StudentRoute><SwapAgreementPage /></StudentRoute>,
  },
  {
    path: "/swap-details/:swapId",
    element: <StudentRoute><SwapDetailsPage /></StudentRoute>,
  },

  // Shared Routes (Both Students and Admins can access)
  {
    path: "/profile",
    Component: ProfilePage,
  },
  {
    path: "/reputation",
    Component: ReputationPage,
  },
  {
    path: "/calendar",
    Component: CalendarPage,
  },
  {
    path: "/privacy",
    Component: PrivacyPolicyPage,
  },
  {
    path: "/security",
    Component: SecurityPage,
  },
  {
    path: "/report",
    Component: ReportUserPage,
  },
  {
    path: "/leaderboard",
    Component: LeaderboardPage,
  },
  {
    path: "/achievements",
    Component: AchievementsPage,
  },
  {
    path: "/community-forum",
    Component: CommunityForumPage,
  },
  {
    path: "/community-forum/:id",
    Component: PostDetailsPage,
  },
  {
    path: "/notification",
    Component: NotificationPage,
  },
  {
    path: "/activity-timeline",
    Component: ActivityTimelinePage,
  },

  // Protected Admin Routes
  {
    path: "/admin-dashboard",
    element: <AdminRoute><AdminDashboardPage /></AdminRoute>,
  },
  {
    path: "/analytics",
    element: <AdminRoute><AnalyticsPage /></AdminRoute>,
  },
]);