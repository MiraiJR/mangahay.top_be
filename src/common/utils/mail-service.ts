/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import * as Nodemailer from 'nodemailer';

export class MailService {
  async sendMail(email: string, title: string, content: string) {
    const transporter = Nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const host = 'http://localhost:3000';
    // send mail with defined transport object
    transporter.sendMail(
      {
        from: 'MangaHay<no-reply>', // sender address
        to: `${email}`, // list of receivers
        subject: `${title.toUpperCase()}`, // Subject line
        text: `${content}`,
        html: ` <h1>Hello,</h1>
        <div>Xác nhận email: </div>
          <a href='${host}/api/auth/verify-email?token=${content}' style='font-size: 30px; margin-left: 10px; color: red; text-align: center; padding: 10px;'>Nhấn vào link này để xác nhận</a>
        <div>Link xác nhận chỉ tồn tại trong vòng 5 phút</div>
        <div>
          <div style='text-align: center;'>MangaHay cảm ơn bạn đã sử dụng website.</div>
          <img src='https://scontent-hkg4-1.xx.fbcdn.net/v/t39.30808-6/338988366_545402211037508_4197446288798331194_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=730e14&_nc_ohc=Z6ee_wti3IcAX8SoK2V&_nc_ht=scontent-hkg4-1.xx&oh=00_AfATv0krvE-2HpJEQiFASB0ysgx_am9MhhhSXXXR1slzEA&oe=642F6D06' alt=''/>
        </div>`, // html body
      },
      function (error, info) {
        if (error) {
          console.log(error);
          throw new BadRequestException(
            `${email} khÔng hợp lệ vui lòng thử lại`,
          );
        } else {
          console.log('Email sent: ' + info.response);
        }
      },
    );
  }

  async sendMailForgetPassword(email: string, title: string, content: string) {
    const transporter = Nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const host = 'http://localhost:3001';
    // send mail with defined transport object
    transporter.sendMail(
      {
        from: 'MangaHay<no-reply>', // sender address
        to: `${email}`, // list of receivers
        subject: `${title.toUpperCase()}`, // Subject line
        text: `${content}`,
        html: ` 
        <div>Hello bạn,</div>
        <div>Đổi mật khẩu theo link: </div>
          <a href='${host}/auth/change-password?token=${content}' style='font-size: 30px; margin-left: 10px; color: red; text-align: center; padding: 10px;'>Nhấn vào link này để xác nhận đổi mật khẩu</a>
        <div>Link này chỉ tồn tại trong vòng 5 phút. Vui lòng click vào để thực hiện đổi mật khẩu.</div>
        <div>
          <div style='text-align: center;'>MangaHay cảm ơn bạn đã sử dụng website.</div>
          <img src='https://scontent-hkg4-1.xx.fbcdn.net/v/t39.30808-6/338988366_545402211037508_4197446288798331194_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=730e14&_nc_ohc=Z6ee_wti3IcAX8SoK2V&_nc_ht=scontent-hkg4-1.xx&oh=00_AfATv0krvE-2HpJEQiFASB0ysgx_am9MhhhSXXXR1slzEA&oe=642F6D06' alt=''/>
        </div>`, // html body
      },
      function (error, info) {
        if (error) {
          console.log(error);
          throw new BadRequestException(
            `${email} khÔng hợp lệ vui lòng thử lại`,
          );
        } else {
          console.log('Email sent: ' + info.response);
        }
      },
    );
  }
}
