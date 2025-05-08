import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@root/features/user/interfaces/user.interface';
class ResetPasswordTemplate {
  public resetPasswordConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { date, email, ipaddress, username } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/reset-password.template.ejs', 'utf-8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: ''
    });
  }
}
export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
