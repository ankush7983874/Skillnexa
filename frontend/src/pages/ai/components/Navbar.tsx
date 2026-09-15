import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationService, NotificationItem } from '../../../services/notificationService';
import Logo from '../../../components/Logo';
import {
  Sparkles,
  LogOut,
  GraduationCap,
  Briefcase,
  Calendar,
  Award,
  FolderGit2,
  Building2,
  Cpu,
  Bell,
  Check,
  CheckCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    if (notif.read) return;
    try {
      await notificationService.markRead(notif._id);
      setNotifications(prev => prev.map(n => (n._id === notif._id ? { ...n, read: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await notificationService.markRead(notif._id);
        setNotifications(prev => prev.map(n => (n._id === notif._id ? { ...n, read: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        // Continue navigation
      }
    }
    setIsOpen(false);

    // Route navigation based on notification type
    if (user?.role === 'STUDENT') {
      switch (notif.type) {
        case 'JOB_POSTED':
        case 'AI_JOB_MATCH':
          navigate('/student/recommendations');
          break;
        case 'SHORTLISTED':
        case 'SELECTED':
          navigate('/student/applications');
          break;
        case 'INTERVIEW':
          navigate('/student/interviews');
          break;
        case 'OFFER_LETTER':
          navigate('/placement-management');
          break;
        default:
          navigate('/student/recommendations');
      }
    } else if (user?.role === 'COMPANY') {
      if (notif.jobId) {
        navigate(`/company/jobs/${notif.jobId}/candidates`);
      } else {
        navigate('/company/applications');
      }
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/student/dashboard' || location.pathname === '/company/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
      isActive(path)
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-900'
    }`;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'JOB_POSTED':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">NEW JOB</span>;
      case 'AI_JOB_MATCH':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">AI MATCH</span>;
      case 'SHORTLISTED':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">SHORTLISTED</span>;
      case 'INTERVIEW':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">INTERVIEW</span>;
      case 'SELECTED':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SELECTED</span>;
      case 'OFFER_LETTER':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">OFFER LETTER</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-400">INFO</span>;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center space-x-2.5 shrink-0 hover:opacity-90 transition">
          <Logo size="sm" />
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <span>Dashboard</span>
          </Link>

          {user.role === 'STUDENT' && (
            <>
              <Link to="/portfolio" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/portfolio')
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/40'
                  : 'text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20'
              }`}>
                <FolderGit2 className="h-3.5 w-3.5" />
                <span>Digital Portfolio</span>
                <span className="px-1 py-0.2 text-[9px] bg-purple-400/20 rounded text-purple-200">P9</span>
              </Link>

              <Link to="/profile" className={linkClass('/profile')}>
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Profile</span>
              </Link>

              <Link to="/student/recommendations" className={linkClass('/student/recommendations')}>
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>AI Job Match</span>
              </Link>

              <Link to="/student/applications" className={linkClass('/student/applications')}>
                <Briefcase className="h-3.5 w-3.5" />
                <span>Applications</span>
              </Link>

              <Link to="/student/interviews" className={linkClass('/student/interviews')}>
                <Calendar className="h-3.5 w-3.5" />
                <span>Interviews</span>
              </Link>

              <Link to="/assessments" className={linkClass('/assessments')}>
                <Award className="h-3.5 w-3.5" />
                <span>Assessments</span>
              </Link>

              <Link to="/ai" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/ai')
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 border border-violet-400/40'
                  : 'text-violet-300 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20'
              }`}>
                <Cpu className="h-3.5 w-3.5" />
                <span>AI Workspace</span>
                <span className="px-1 py-0.2 text-[9px] bg-violet-400/20 rounded text-violet-200">P10</span>
              </Link>
            </>
          )}

          {user.role === 'COMPANY' && (
            <>
              <Link to="/company/jobs" className={linkClass('/company/jobs')}>
                <Building2 className="h-3.5 w-3.5" />
                <span>Job Posts</span>
              </Link>

              <Link to="/company/applications" className={linkClass('/company/applications')}>
                <Briefcase className="h-3.5 w-3.5" />
                <span>Applications & Portfolios</span>
              </Link>

              <Link to="/company/interviews" className={linkClass('/company/interviews')}>
                <Calendar className="h-3.5 w-3.5" />
                <span>Interviews</span>
              </Link>

              <Link to="/academia-collaboration" className={linkClass('/academia-collaboration')}>
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Academia Collaboration</span>
              </Link>

              <Link to="/placement-management" className={linkClass('/placement-management')}>
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                <span>Placements</span>
              </Link>

              <Link to="/ai" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/ai')
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 border border-violet-400/40'
                  : 'text-violet-300 hover:text-white bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20'
              }`}>
                <Cpu className="h-3.5 w-3.5" />
                <span>AI Intelligence</span>
                <span className="px-1 py-0.2 text-[9px] bg-violet-400/20 rounded text-violet-200">P10</span>
              </Link>
            </>
          )}

          {(user.role === 'FACULTY' || user.role === 'INSTITUTION' || user.role === 'ADMIN') && (
            <>
              {user.role === 'FACULTY' && (
                <Link to="/faculty-portal" className={linkClass('/faculty-portal')}>
                  <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Faculty Portal</span>
                </Link>
              )}

              {(user.role === 'INSTITUTION' || user.role === 'ADMIN') && (
                <Link to="/institution-admin" className={linkClass('/institution-admin')}>
                  <Building2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Institution / HOD</span>
                </Link>
              )}

              <Link to="/academia-collaboration" className={linkClass('/academia-collaboration')}>
                <span>Academia Collaboration</span>
              </Link>

              <Link to="/placement-management" className={linkClass('/placement-management')}>
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                <span>Placements</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link to="/admin-console" className={linkClass('/admin-console')}>
                  <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                  <span>Admin Console</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User profile, Notifications & Logout */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                if (!isOpen) fetchNotifications();
              }}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full animate-pulse shadow-sm shadow-rose-500/50">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden text-xs space-y-0">
                {/* Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center space-x-2 font-bold text-white">
                    <Bell className="h-4 w-4 text-blue-400" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-blue-400 hover:text-blue-300 text-[11px] font-medium flex items-center space-x-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin scrollbar-thumb-slate-800">
                  {loading && notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 space-y-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <span>Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <Bell className="h-8 w-8 mx-auto text-slate-700 stroke-[1.5]" />
                      <p className="text-slate-400 font-medium">No notifications yet</p>
                      <p className="text-[11px] text-slate-600">You'll be notified when jobs match your profile or applications get updated.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 cursor-pointer transition flex items-start space-x-3 ${
                          notif.read
                            ? 'bg-slate-950/40 hover:bg-slate-900/40 text-slate-400'
                            : 'bg-slate-900/80 hover:bg-slate-900 text-slate-100 font-medium border-l-2 border-blue-500'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">{getTypeBadge(notif.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-200 text-xs">{notif.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed text-[11px]">{notif.message}</p>
                          {notif.matchScore && (
                            <div className="mt-1 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 font-mono text-[10px] border border-violet-500/20">
                              <Sparkles className="h-3 w-3" />
                              <span>Match Score: {notif.matchScore}%</span>
                            </div>
                          )}
                        </div>
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkRead(e, notif)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-blue-400 transition"
                            title="Mark read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-200 truncate max-w-[120px]">{user.name}</span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">({user.role})</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
