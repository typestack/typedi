import "reflect-metadata";
import {Container} from "../../src/index";
import {QuestionRepository} from "./QuestionRepository";
import {QuestionController} from "./QuestionController";

Container.import([
    QuestionController,
    QuestionRepository,
]);
const request1 = { param: "Timber" };
const controller1 = Container.of(request1).get(QuestionController);
controller1.save("Timber");
Container.reset(request1);
// Container.removeFromRequest(request1, QuestionController);

const request2 = { param: "Guest" };
const controller2 = Container.of(request2).get(QuestionController);
controller2.save("");
Container.reset(request2);