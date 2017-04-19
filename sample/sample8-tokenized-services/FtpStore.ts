import {Store} from "./Store";

export class FtpStore implements Store {

    save(): string {
         return "saved to ftp";
    }

}