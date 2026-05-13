import User from "../models/User.model.js"
import RefreshToken from "../models/RefreshToken.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
// normalize expiresIn values from env or inputs
const normalizeExpiresIn = (val, fallback) => {
    if (val === undefined || val === null) return fallback
    let v = String(val).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).trim()
    // pure number (seconds)
    if (/^\d+$/.test(v)) return Number(v)
    // number with s/ms/m/h/d suffix
    if (/^\d+(ms|s|m|h|d)$/.test(v)) return v
    // if ends with 's' like '3600s' convert to number seconds
    if (/^\d+s$/.test(v)) return Number(v.slice(0, -1))
    return fallback
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be minimum 8 characters"
            })
        }
        if (!email.includes("@") || !email.includes(".")) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            })
        }
        // let existingUsers = await User.find()
        // if (existingUsers.length > 0) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Public registration is closed"
        //     })
        // }

        let existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        })
        const accessToken = jwt.sign({
            id: user._id,
            role: user.role
        },
            process.env.JWT_SECRET,
            {
                expiresIn: normalizeExpiresIn(process.env.JWT_EXPIRES_IN, '1h')
            }
        )
        const refreshToken = jwt.sign({
            id: user._id
        },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: normalizeExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN, '7d')
            }
        )
        const refreshTtlMs = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000)
        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + refreshTtlMs)
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })
        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}





// LOGIN
export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            })
        }

        const user = await User.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        user.lastSeen = new Date()

        await user.save()

        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: normalizeExpiresIn(process.env.JWT_EXPIRES_IN, '1h')
            }
        )

        const refreshToken = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: normalizeExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN, '7d')
            }
        )

        const refreshTtlMs = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000)
        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + refreshTtlMs)
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        })

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })

    }

}





// REFRESH TOKEN
export const refreshAccessToken = async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token missing"
            })
        }

        const tokenExists = await RefreshToken.findOne({
            token: refreshToken
        })

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            })
        }

        let decoded

        try {

            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            )

        }
        catch (error) {

            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            })

        }

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const newAccessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: normalizeExpiresIn(process.env.JWT_EXPIRES_IN, '1h')
            }
        )

        return res.status(200).json({
            success: true,
            message: "New access token generated",
            data: {
                accessToken: newAccessToken
            }
        })

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })

    }

}





// LOGOUT
export const logoutUser = async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken

        if (refreshToken) {

            await RefreshToken.findOneAndDelete({
                token: refreshToken
            })

        }

        res.clearCookie("refreshToken")

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })

    }

}





// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        const user = await User.findOne({ email })

        if (user) {

            const resetToken = jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            )

            // send email here later
            // console.log(resetToken)

        }

        return res.status(200).json({
            success: true,
            message: "If email exists, reset link sent"
        })

    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })

    }

}





// RESET PASSWORD
export const resetPassword = async (req, res) => {

    try {

        const token = req.params.token

        const { password } = req.body

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "New password required"
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password too short"
            })
        }

        let decoded

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            )

        }
        catch (error) {

            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            })

        }

        const user = await User.findById(decoded.id).select("+password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        user.password = hashedPassword

        await user.save()

        await RefreshToken.deleteMany({
            user: user._id
        })

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        })

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })

    }

}
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            data: user
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }

}

const parseDurationToMs = (val, fallbackMs) => {
    if (val === undefined || val === null) return fallbackMs
    let v = String(val).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).trim()
    // pure number -> seconds
    if (/^\d+$/.test(v)) return Number(v) * 1000
    // ms, s, m, h, d
    const m = v.match(/^(\d+)(ms|s|m|h|d)$/)
    if (m) {
        const n = Number(m[1])
        const unit = m[2]
        switch (unit) {
            case 'ms': return n
            case 's': return n * 1000
            case 'm': return n * 60 * 1000
            case 'h': return n * 60 * 60 * 1000
            case 'd': return n * 24 * 60 * 60 * 1000
        }
    }
    // fallback
    return fallbackMs
}