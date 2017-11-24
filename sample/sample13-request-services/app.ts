import "reflect-metadata";
import {Container} from "../../src/index";
import {QuestionRepository} from "./QuestionRepository";
import {QuestionController} from "./QuestionController";

Container.import([
    QuestionController,
    QuestionRepository,
]);
const request1 = { param: "Timber" };
const controller1 = Container.getFromRequest(request1, QuestionController);
controller1.save("Timber");
Container.removeFromRequest(request1, QuestionController);

const request2 = { param: "Guest" };
const controller2 = Container.getFromRequest(request2, QuestionController);
controller2.save("");

console.log((Container as any)["services"]);