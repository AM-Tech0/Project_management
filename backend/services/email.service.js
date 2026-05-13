import transporter from "../config/nodemailer.js"
export const noticeTemplate=(title,message,userName)=>{
    return ` 
    <div style="background:#f4f4f4;padding:40px;font-family:Arial,sans-serif;color:#111111;">
        
        <div style="max-width:650px;margin:auto;background:#ffffff;border:1px solid #dcdcdc;">
            
            <div style="padding:32px;border-bottom:1px solid #dcdcdc;">
                <h1 style="margin:0;font-size:28px;font-weight:700;color:#000000;letter-spacing:-1px;">
                    ${title}
                </h1>

                <p style="margin-top:12px;font-size:14px;color:#555555;line-height:24px;">
                    Official notice from Project Management System
                </p>
            </div>

            <div style="padding:32px;">

                <p style="font-size:15px;color:#222222;line-height:28px;margin-bottom:24px;">
                    Hello ${userName},
                </p>

                <div style="border-left:3px solid #111111;padding-left:18px;margin-bottom:28px;">
                    <p style="font-size:15px;color:#333333;line-height:28px;margin:0;">
                        ${message}
                    </p>
                </div>

                <p style="font-size:13px;color:#777777;line-height:24px;">
                    Please do not reply directly to this email. 
                    Contact your administrator for additional support.
                </p>

            </div>

            <div style="padding:20px 32px;border-top:1px solid #dcdcdc;background:#fafafa;">
                <p style="margin:0;font-size:12px;color:#666666;letter-spacing:0.3px;">
                    PROJECT MANAGEMENT SYSTEM
                </p>
            </div>

        </div>

    </div>

    `
}
export const sendNoticeEmail=async(user,subject,message)=>{
    try{
        const html=noticeTemplate(
            subject,
            message,
            user.name
        )
        const info=await transporter.sendMail({
            from:`"Project Management" <${process.env.SMTP_USER}>`,
            to:user.email,
            subject:subject,
            html:html
        })
        return info
    }
    catch(error){
        console.log("send email error",error)
        throw new Error("email failed")
    }
}