import {Service} from "../../src/decorators/Service";
import {PostManager} from "./PostManager";
import {PostQueryBuilder} from "./PostQueryBuilder";
import {PostRepository} from "./PostRepository";

export const PostController = Service([
    PostManager,
    PostRepository,
    PostQueryBuilder
], (manager, repository, queryBuilder) => {
    return {
        id: manager.getId(),
        name: repository.getName(),
        query: queryBuilder.build()
    };
});
