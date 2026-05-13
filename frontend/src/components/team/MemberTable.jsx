import Avatar from '../ui/Avatar'
import RoleBadge from './RoleBadge'
import {fmtRelative} from '../../utils/formatters'
import {Link} from 'react-router-dom'

export default function MemberTable({members, userRole}){
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b border-slate-200 text-[13px] text-slate-500 bg-slate-50">
            <th className="text-left font-medium px-5 py-3">Name</th>
            <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Email</th>
            <th className="text-left font-medium px-5 py-3">Role</th>
            <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Joined</th>
            {userRole==='admin' && <th className="px-5 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.map(m=>(
            <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-100">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <span className="font-medium text-slate-900">{m.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">{m.email}</td>
              <td className="px-5 py-3"><RoleBadge role={m.role} /></td>
              <td className="px-5 py-3 text-slate-500 text-[13px] hidden md:table-cell">{fmtRelative(m.createdAt)}</td>
              {userRole==='admin' && (
                <td className="px-5 py-3 text-right">
                  <Link to={`/team/${m._id}`} className="text-blue-600 hover:underline text-[13px] font-medium">View</Link>
                </td>
              )}
            </tr>
          ))}
          {members.length===0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-slate-500">No members found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
