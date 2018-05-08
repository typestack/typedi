import {Inject, Service} from "../../src";
import * as fs from "fs";

@Service()
export class FileReader {

    constructor(@Inject("fs") private fileSystem: typeof fs) {
    }

    read(filePath: string) {
        return new Promise((ok, fail) => {
            this.fileSystem.readFile(filePath, (error, data) => {
                if (error) return fail(error);
                ok(data);
            });
        });
    }

}