import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { config } from '@root/config';
import jwt from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IResetPasswordParams, IUserDocument } from '@root/features/user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password.template';
export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }
    const passwordMatch = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credential');
    }
    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    const userJwt: string = jwt.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      avatarColor: existingUser.avatarColor,
      uId: existingUser.uId,
      createdAt: existingUser.createdAt
    } as IUserDocument;
    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.resetPasswordConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: 'noemie.koss87@ethereal.email',
      subject: 'Password reset confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User logged in successfully', user: userDocument, token: userJwt });
  }
}
