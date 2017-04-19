import "reflect-metadata";
import {Container} from "../../src/Container";
import {UserRepository} from "./UserRepository";
import {User} from "./User";
import {TestLogger} from "./TestLogger";

const logger = new TestLogger();
Container.set(UserRepository, new UserRepository(logger));

const userRepository = Container.get(UserRepository);
userRepository.save(new User("Johny", "Cage"));
console.log("last message in test logger: ", logger.lastMessage);