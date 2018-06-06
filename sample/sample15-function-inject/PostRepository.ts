import {Service} from "../../src/decorators/Service";

export const PostRepository = Service(() => ({
    getName() {
        return "hello from post repository";
    }
}));
