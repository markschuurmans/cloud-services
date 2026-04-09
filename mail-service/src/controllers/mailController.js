import MailLog from "../models/MailLog.js";
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

export const sendRegistrationMail = async (req, res, next) => {
    try {
        const required = ["recipientEmail", "displayName", "competitionTitle"];
        const missing = validateRequired(required, req.body);

        if (missing.length) {
            return res
                .status(400)
                .json({
                    error: `Missing required fields: ${missing.join(", ")}`,
                });
        }

        const { recipientEmail, displayName, competitionTitle } = req.body;
        const subject = `Registratie bevestigd voor ${competitionTitle}`;
        const html = registrationTemplate({ displayName, competitionTitle });

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
        const required = ["recipientEmail", "displayName", "competitionTitle"];
        const missing = validateRequired(required, req.body);

        if (missing.length) {
            return res
                .status(400)
                .json({
                    error: `Missing required fields: ${missing.join(", ")}`,
                });
        }

        const { recipientEmail, displayName, competitionTitle, deadline } =
            req.body;
        const subject = `Wedstrijd gesloten: ${competitionTitle}`;
        const html = deadlineTemplate({
            displayName,
            competitionTitle,
            deadline,
        });

        queueMailDelivery({
            recipientEmail,
            subject,
            html,
            mailType: "competition-end",
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
            "competitionTitle",
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

        const { recipientEmail, displayName, competitionTitle, score } =
            req.body;
        const subject = `Je score voor ${competitionTitle}`;
        const html = scoreResultTemplate({
            displayName,
            competitionTitle,
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
            "competitionTitle",
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

        const { recipientEmail, displayName, competitionTitle, score } =
            req.body;
        const subject = `Gefeliciteerd winnaar van ${competitionTitle}`;
        const html = winnerTemplate({ displayName, competitionTitle, score });

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
