import {Container} from "../../src";
import {PostController} from "./PostController";

const postController = Container.get(PostController);
console.log(postController);