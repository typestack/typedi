import "reflect-metadata";
import {Container} from "../../src/Container";
import {UserRepository} from "./UserRepository";
import {User} from "./User";

const userRepository = Container.get(UserRepository);
userRepository.save(new User("Johny", "Cage"));