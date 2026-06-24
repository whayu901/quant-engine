import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Code,
  Lightbulb,
  Video,
  Film,
  LogOut,
  FolderOpen,
  TrendingUp,
  UserCheck,
  PieChart
} from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const menuItems = [
    // Main Dashboards
    {
      section: 'Dashboards',
      items: [
        {
          path: '/projects',
          label: 'Projects',
          icon: FolderOpen,
          roles: ['all']
        },
        {
          path: '/admin/dashboard',
          label: 'Admin Dashboard',
          icon: LayoutDashboard,
          roles: ['super_admin', 'org_admin', 'admin']
        },
        {
          path: '/qual/dashboard',
          label: 'Qualitative Dashboard',
          icon: BarChart3,
          roles: ['researcher', 'team_lead', 'super_admin', 'org_admin']
        },
        {
          path: '/quant/dashboard',
          label: 'Quantitative Dashboard',
          icon: PieChart,
          roles: ['analyst', 'team_lead', 'super_admin', 'org_admin']
        },
        {
          path: '/client/dashboard',
          label: 'Client Dashboard',
          icon: UserCheck,
          roles: ['client', 'super_admin', 'org_admin']
        }
      ]
    },
    // Phase 3 - Analysis Tools
    {
      section: 'Analysis Tools (Phase 3)',
      items: [
        {
          path: '/open-ends',
          label: 'Open Ends Coding',
          icon: Code,
          roles: ['researcher', 'analyst', 'team_lead', 'super_admin', 'org_admin']
        },
        {
          path: '/concepts',
          label: 'Concept Testing',
          icon: Lightbulb,
          roles: ['researcher', 'analyst', 'team_lead', 'super_admin', 'org_admin']
        }
      ]
    },
    // Phase 5 - Media Management
    {
      section: 'Media Management (Phase 5)',
      items: [
        {
          path: '/clips',
          label: 'Clips Manager',
          icon: Video,
          roles: ['researcher', 'team_lead', 'super_admin', 'org_admin']
        },
        {
          path: '/reels',
          label: 'Reels Compilation',
          icon: Film,
          roles: ['researcher', 'team_lead', 'super_admin', 'org_admin']
        }
      ]
    },
    // Administration
    {
      section: 'Administration',
      items: [
        {
          path: '/admin/users',
          label: 'User Management',
          icon: Users,
          roles: ['super_admin', 'org_admin', 'admin']
        }
      ]
    }
  ]

  const hasAccess = (roles) => {
    if (roles.includes('all')) return true
    return roles.includes(user.role)
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Qual Engine</h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((section) => (
                <div key={section.section} className="relative group">
                  <button className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                    {section.section}
                  </button>
                  <div className="absolute z-10 left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {section.items.map((item) => {
                        if (!hasAccess(item.roles)) return null
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`${
                              isActive(item.path)
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            } group flex items-center px-4 py-2 text-sm`}
                          >
                            <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {menuItems.map((section) => (
            <div key={section.section}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.section}
              </div>
              {section.items.map((item) => {
                if (!hasAccess(item.roles)) return null
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      isActive(item.path)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-2" />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}