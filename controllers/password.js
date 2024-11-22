
const uuid = require('uuid');
const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Forgotpassword = require('../models/password');


const port = 3000;

const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, isactive: "ACTIVE", userId: user.id });


            const brevoApiKey = process.env.PASSWORD_KEY;
            const apiInstance = new TransactionalEmailsApi();
            const apiKey = apiInstance.authentications['apiKey'];
            apiKey.apiKey = brevoApiKey;

            const sendSmtpEmail = new SendSmtpEmail();
            sendSmtpEmail.subject = 'Reset Password Request';
            sendSmtpEmail.htmlContent = `<p>Click the link below to reset your password.</p><a href="http://localhost:${port}/password/resetpassword/${id}">Reset password</a>`;
            sendSmtpEmail.sender = { name: 'Nethravathi B S', email: 'nethranethra451@gmail.com' };
            sendSmtpEmail.to = [{ email }];

            apiInstance.sendTransacEmail(sendSmtpEmail)
                .then((data) => {
                    console.log('Email sent successfully:', data);
                    return res.status(200).json({ message: 'Link to reset password sent to your email', success: true });
                })
                .catch((error) => {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Failed to send email', success: false });
                });
        } else {
            throw new Error('User does not exist');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }
};

const resetpassword = (req, res) => {
    const id = req.params.id;
    Forgotpassword.findOne({ where : { id }})
    .then(forgotpasswordrequest => {
        if (forgotpasswordrequest) {
            forgotpasswordrequest.update({ active: false });
            // Render the HTML form for resetting password
            res.status(200).send(
                `<html>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>Reset Password</button>
                    </form>
                </html>`
            );
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    });
}

// Function to update user's password
const updatepassword = (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        Forgotpassword.findOne({ where : { id: resetpasswordid }})
        .then(resetpasswordrequest => {
            User.findOne({ where: { id: resetpasswordrequest.userId }})
            .then(user => {
                if (user) {
                    // Encrypt the new password
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if (err) {
                            console.error(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            if (err) {
                                console.error(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash })
                            .then(() => {
                                res.status(201).json({ message: 'Successfully updated the new password' });
                            })
                            .catch(error => {
                                console.error(error);
                                throw new Error(error);
                            });
                        });
                    });
                } else {
                    return res.status(404).json({ error: 'No user exists', success: false });
                }
            });
        });
    } catch (error) {
        return res.status(403).json({ error: error.message, success: false });
    }
}

module.exports = {
    forgotpassword,
    resetpassword,
    updatepassword
};
