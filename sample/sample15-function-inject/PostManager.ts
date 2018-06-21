import {Service} from "../../src/decorators/Service";

export const PostManager = Service(() => ({
    getId() {
        return "some post id";
    }
}));
