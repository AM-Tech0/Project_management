export default function RoleBadge({role}){
  const styles={
    admin:'bg-red-100 text-red-700',
    manager:'bg-blue-100 text-blue-700',
    member:'bg-slate-100 text-slate-600'
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${styles[role]||styles.member}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}
