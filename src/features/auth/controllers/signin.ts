import { Request, Response } from 'express';
import { config } from '@root/config';
import jwt from 'jsonwebtoken ';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }
  }
}
