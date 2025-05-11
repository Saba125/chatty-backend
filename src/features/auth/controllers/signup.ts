import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { Request, Response } from 'express';
import { signupSchema } from '../schemes/signup';
import { IAuthDocument, ISignUpData } from '../interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { Types } from 'mongoose'; // ✅
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@root/features/user/interfaces/user.interface';
import { omit } from 'lodash';
import { authQueue } from '@service/queues/auth.queue';
import { userQueue } from '@service/queues/user.queue';
import jwt from 'jsonwebtoken';
import { config } from '@root/config';
const userCache: UserCache = new UserCache();
export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExists) {
      throw new BadRequestError('Invalid credential');
    }
    const authObjectId = new Types.ObjectId();
    const userObjectId = new Types.ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    const result: UploadApiResponse | UploadApiErrorResponse | undefined = await uploads(avatarImage, `${userObjectId}`, true, true);
    if (!result?.public_id) {
      console.error('Cloudinary upload error:', result);
      throw new BadRequestError('File upload: Error occured.Try again');
    }
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/dobivcvi5/image/upload/v${result.version}/${userObjectId}`;
    // add to redis cache
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);
    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    console.log(userDataForCache);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserToJob('addUserToDB', { value: userDataForCache });
    const userJwt: string = SignUp.prototype.signupToken(authData, userObjectId);
    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
  }
  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
  private signupToken(data: IAuthDocument, userObjectId: Types.ObjectId): string {
    return jwt.sign(
      { userId: userObjectId, uId: data.uId, email: data.email, username: data.username, avatarColor: data.avatarColor },
      config.JWT_TOKEN!
    );
  }
  private userData(data: IAuthDocument, userObjectId: Types.ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
