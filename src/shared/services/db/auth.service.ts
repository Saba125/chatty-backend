import { Helpers } from '@global/helpers/helpers';
import { IAuthDocument } from '@root/features/auth/interfaces/auth.interface';
import { AuthModel } from '@root/features/auth/models/auth.schema';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username), email: Helpers.lowerCase(email) }]
    };
    const user = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }
  public async getUserByUsername(username: string): Promise<IAuthDocument> {
    const user = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) })) as IAuthDocument;
    return user;
  }
  public async getUserByEmail(email: string): Promise<IAuthDocument> {
    const user = (await AuthModel.findOne({ email: Helpers.lowerCase(email) })) as IAuthDocument;
    return user;
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<IAuthDocument> {
    const user = (await AuthModel.findOneAndUpdate(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      },
      { new: true } // return the updated document
    )) as IAuthDocument;

    return user;
  }
  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).exec()) as IAuthDocument;

    return user;
  }
}
export const authService: AuthService = new AuthService();
