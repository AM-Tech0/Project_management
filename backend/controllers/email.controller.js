// controllers/email.controller.js

import User from "../models/User.model.js"
import { sendNoticeEmail } from "../services/email.service.js"

export const sendEmail = async (req, res) => {

    try {

        const body = req.body

        // Accept either recipientId (user id) OR to/recipientEmail (raw email)
        const recipientId = body.recipientId
        const recipientEmail = body.to || body.recipientEmail
        const subject = body.subject || body.title
        const message = body.message || body.text

        if (!recipientId && !recipientEmail) {
            return res.status(400).json({ success: false, message: 'recipient required (recipientId or to)' })
        }

        if (!subject || String(subject).trim() === '') {
            return res.status(400).json({ success: false, message: 'subject required' })
        }

        if (!message || String(message).trim() === '') {
            return res.status(400).json({ success: false, message: 'message required' })
        }

        let user = null

        if (recipientId) {
            user = await User.findById(recipientId)
            if (!user) {
                return res.status(404).json({ success: false, message: 'user not found' })
            }
            await sendNoticeEmail(user, subject, message)
        } else {
            // recipientEmail provided; try to find user, else send to raw email
            const found = await User.findOne({ email: String(recipientEmail).toLowerCase() })
            if (found) {
                await sendNoticeEmail(found, subject, message)
            } else {
                // send to raw email using name if provided
                const tempUser = { email: recipientEmail, name: body.name || recipientEmail }
                await sendNoticeEmail(tempUser, subject, message)
            }
        }

        return res.status(200).json({
            success: true,
            message: "email sent"
        })

    }
    catch (error) {

        console.log("send email controller error", error)

        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

export const sendBulkEmail = async (req, res) => {

    try {

        const body = req.body

        if (!body.recipientIds || body.recipientIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "recipient ids required"
            })
        }

        if (body.recipientIds.length > 20) {
            return res.status(400).json({
                success: false,
                message: "max 20 recipients allowed"
            })
        }

        let sent = []
        let failed = []

        for (let i = 0; i < body.recipientIds.length; i++) {

            const user = await User.findById(
                body.recipientIds[i]
            )

            if (!user) {

                failed.push({
                    id: body.recipientIds[i],
                    reason: "user not found"
                })

                continue
            }

            try {

                await sendNoticeEmail(
                    user,
                    body.subject,
                    body.message
                )

                sent.push(user._id)

            }
            catch (error) {

                failed.push({
                    id: user._id,
                    reason: "email failed"
                })
            }
        }

        return res.status(200).json({
            success: true,
            sent,
            failed
        })

    }
    catch (error) {

        console.log("bulk email error", error)

        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}