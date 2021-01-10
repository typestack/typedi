import { Reader } from './Reader';

export class FtpReader implements Reader {
  read(): string {
    return 'read from ftp';
  }
}
