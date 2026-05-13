import {useState} from 'react'
import {useAuth} from '../../hooks/useAuth'
import EmailComposer from '../../components/settings/EmailComposer'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function SettingsPage(){
  const {user} = useAuth()
  const [activeTab,setActiveTab] = useState('Profile')

  const tabs=['Profile']
  if(user?.role==='admin') tabs.push('Team','Email','General')
  else tabs.push('General')

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(t=>(
              <button
                key={t}
                onClick={()=>setActiveTab(t)}
                className={`px-4 py-2 text-left text-[14px] font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab===t 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 min-w-0">
          {activeTab==='Profile' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-[16px] font-medium text-slate-900 mb-4">Profile Information</h3>
                <form className="space-y-4">
                  <Input label="Full Name" defaultValue={user?.name} />
                  <Input label="Email Address" defaultValue={user?.email} disabled />
                  <div className="pt-2">
                    <Button type="button">Save Changes</Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-[16px] font-medium text-slate-900 mb-4">Change Password</h3>
                <form className="space-y-4">
                  <Input label="Current Password" type="password" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm New Password" type="password" />
                  <div className="pt-2">
                    <Button type="button">Update Password</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab==='Team' && user?.role==='admin' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-[16px] font-medium text-slate-900 mb-4">Team Settings</h3>
                <form className="space-y-4">
                  <Input label="Workspace Name" defaultValue="My Workspace" />
                  <div className="pt-2">
                    <Button type="button">Save Settings</Button>
                  </div>
                </form>
              </div>
              
              <div className="border border-red-200 rounded-lg p-6 bg-red-50/50">
                <h3 className="text-[16px] font-medium text-red-900 mb-2">Danger Zone</h3>
                <p className="text-[13px] text-red-700 mb-4">Clearing archived projects cannot be undone.</p>
                <Button variant="danger">Clear Archived Projects</Button>
              </div>
            </div>
          )}

          {activeTab==='Email' && user?.role==='admin' && (
            <EmailComposer />
          )}

          {activeTab==='General' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-[16px] font-medium text-slate-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900">Email Notifications</p>
                      <p className="text-[13px] text-slate-500">Receive daily summaries</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[14px] font-medium text-slate-900">Dark Mode</p>
                      <p className="text-[13px] text-slate-500">Toggle dark theme</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
