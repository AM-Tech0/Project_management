const requireRole = ( ...roles ) => {
    return async(req,res,next)=>{
        try{
            if(!req.user){
                return res.status(401).json({
                    success:false,
                    message:"Unauthorized"
                })
            }
            let allowed = false
            for(let i = 0 ; i < roles.length ; i++){
                if(req.user.role === roles[i]){
                    allowed = true
                }
            }
            if(!allowed){
                return res.status(403).json({
                    success:false,
                    message:"Access denied"
                })
            }
            next()
        }
        catch(error){
            return res.status(500).json({
                success:false,
                message:"Server error",
                error:error.message
            })
        }
    }
}
export default requireRole;