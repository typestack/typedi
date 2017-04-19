import {LoggerInterface} from "./LoggerInterface";

export class TestLogger implements LoggerInterface {

    lastMessage: string;

    log(message: string) {
        this.lastMessage = message;
    }

}