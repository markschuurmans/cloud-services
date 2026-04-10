import MailLog from "../models/MailLog.js";
import axios from "axios";
import transporter, {
    MAIL_FROM,
    SMTP_TIMEOUT_MS,
} from "../config/transporter.js";
import registrationTemplate from "../templates/registrationTemplate.js";
import deadlineTemplate from "../templates/deadlineTemplate.js";
import scoreResultTemplate from "../templates/scoreResultTemplate.js";
import winnerTemplate from "../templates/winnerTemplate.js";

const withTimeout = (promise, timeoutMs) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(
                () => reject(new Error(`SMTP timeout after ${timeoutMs}ms`)),
                timeoutMs,
            );
        }),
    ]);
};

const processMailDelivery = async ({
    recipientEmail,
    subject,
    html,
    mailType,
    payload,
}) => {
    try {
        await withTimeout(
            transporter.sendMail({
                from: MAIL_FROM,
                to: recipientEmail,
                subject,
                html,
            }),
            SMTP_TIMEOUT_MS,
        );

        await MailLog.create({
            mailType,
            recipientEmail,
            subject,
            status: "sent",
            payload,
            sentAt: new Date(),
        });
    } catch (error) {
        console.error(
            `[mail-service] Failed to send ${mailType} mail to ${recipientEmail}:`,
            error.message,
        );
        await MailLog.create({
            mailType,
            recipientEmail,
            subject,
            status: "failed",
            errorMessage: error.message,
            payload,
            sentAt: null,
        });
    }
};

const queueMailDelivery = (mailData) => {
    setImmediate(() => {
        processMailDelivery(mailData).catch((error) => {
            console.error(
                "[mail-service] Mail delivery processing crashed:",
                error.message,
            );
        });
    });
};

const validateRequired = (requiredFields, body) => {
    const missing = requiredFields.filter((field) => {
        const value = body[field];
        return value === undefined || value === null || value === "";
    });

    return missing;
};

const getTargetTitle = (body) => body.targetTitle || body.competitionTitle;

export const sendRegistrationMail = async (req, res, next) => {
    try {
        const required = ["recipientEmail", "displayName"];
        const missing = validateRequired(required, req.body);

        if (!getTargetTitle(req.body)) {
            missing.push("targetTitle");
        }

        if (missing.length) {
            return res
                .status(400)
                .json({
                    error: `Missing required fields: ${missing.join(", ")}`,
                });
        }

        const { recipientEmail, displayName } = req.body;
        const targetTitle = getTargetTitle(req.body);
        const subject = `Registratie bevestigd voor ${targetTitle}`;
        const html = registrationTemplate({ displayName, targetTitle });

        queueMailDelivery({
            recipientEmail,
            subject,
            html,
            mailType: "registration",
            payload: req.body,
        });

        return res.status(202).json({
            message: "Registration mail queued for delivery.",
            status: "accepted",
        });
    } catch (error) {
        return next(error);
    }
};

export const sendCompetitionEndMail = async (req, res, next) => {
    try {
        const required = ["recipientEmail", "displayName"];
        const missing = validateRequired(required, req.body);

        if (!getTargetTitle(req.body)) {
            missing.push("targetTitle");
        }

        if (missing.length) {
            return res
                .status(400)
                .json({
                    error: `Missing required fields: ${missing.join(", ")}`,
                });
        }

        const { recipientEmail, displayName, deadline } =
            req.body;
        const targetTitle = getTargetTitle(req.body);
        const subject = `Target gesloten: ${targetTitle}`;
        const html = deadlineTemplate({
            displayName,
            targetTitle,
            deadline,
        });

        queueMailDelivery({
            recipientEmail,
            subject,
            html,
            mailType: "target-end",
            payload: req.body,
        });

        return res.status(202).json({
            message: "Competition-end mail queued for delivery.",
            status: "accepted",
        });
    } catch (error) {
        return next(error);
    }
};

export const sendScoreResultMail = async (req, res, next) => {
    try {
        const required = [
            "recipientEmail",
            "displayName",
            "targetTitle",
            "score",
        ];
        const missing = validateRequired(required, req.body);

        if (missing.length) {
            return res
                .status(400)
                .json({
                    error: `Missing required fields: ${missing.join(", ")}`,
                });
        }

        const { recipientEmail, displayName, targetTitle, score } =
            req.body;
        const subject = `Je score voor ${targetTitle}`;
        const html = scoreResultTemplate({
            displayName,
            targetTitle,
            score,
        });

        queueMailDelivery({
            recipientEmail,
            subject,
            html,
            mailType: "score-result",
            payload: req.body,
        });

        return res.status(202).json({
            message: "Score-result mail queued for delivery.",
            status: "accepted",
        });
    } catch (error) {
        return next(error);
    }
};

export const sendWinnerMail = async (req, res, next) => {
    try {
        const required = [
            "recipientEmail",
            "displayName",
            "targetTitle",
            "score",
        ];
        const missing = validateRequired(required, req.body);

        if (missing.length) {
            return res
                .status(400)
                .json({
                    error: `Missing required fields: ${missing.join(", ")}`,
                });
        }

        const { recipientEmail, displayName, targetTitle, score } =
            req.body;
        const subject = `Gefeliciteerd winnaar van ${targetTitle}`;
        const html = winnerTemplate({ displayName, targetTitle, score });

        queueMailDelivery({
            recipientEmail,
            subject,
            html,
            mailType: "winner",
            payload: req.body,
        });

        return res.status(202).json({
            message: "Winner mail queued for delivery.",
            status: "accepted",
        });
    } catch (error) {
        return next(error);
    }
};

export const notifyTargetEnd = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const registerUrl = process.env.REGISTER_SERVICE_URL || "";
        const authUrl = process.env.AUTH_SERVICE_URL || "";
        const headers = { Authorization: req.headers.authorization };

        const targetRes = await axios.get(`${registerUrl}/api/targets/${targetId}`, { headers });
        const target = targetRes.data;

        const regsRes = await axios.get(`${registerUrl}/api/targets/${targetId}/registrations`, { headers });
        const registrations = regsRes.data;

        if (!registrations || registrations.length === 0) {
            return res.status(200).json({ message: "No participants to notify." });
        }

        const participantIds = [...new Set(registrations.map(r => r.participantId))];
        console.log(`[Mail Service] Notifying ${participantIds.length} unique participants for target ${target.title}`);

        for (const userId of participantIds) {
            try {
                const userRes = await axios.get(`${authUrl}/api/auth/users/${userId}`, { headers });
                const user = userRes.data;

                const subject = `Target gesloten: ${target.title}`;
                const html = deadlineTemplate({
                    displayName: user.displayName,
                    targetTitle: target.title,
                    deadline: target.deadline,
                });

                queueMailDelivery({
                    recipientEmail: user.email,
                    subject,
                    html,
                    mailType: "target-end",
                    payload: { targetId, userId },
                });
            } catch (err) {
                console.error(`[Mail Service] Failed to notify user ${userId}:`, err.message);
            }
        }

        return res.status(202).json({
            message: `Notification process for target ${targetId} initiated.`,
            status: "accepted",
            participantCount: participantIds.length
        });
    } catch (error) {
        console.error(`[Mail Service] notifyTargetEnd error:`, error.message);
        return next(error);
    }
};
