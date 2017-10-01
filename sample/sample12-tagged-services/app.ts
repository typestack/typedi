import "reflect-metadata";
import {Container} from "../../src/Container";
import {Token} from "../../src/Token";
import {Service} from "../../src/decorators/Service";
import {InjectTagged} from "../../src/decorators/Inject";

interface ExtensionInterface {
  readonly name: string;
}

const Extension = new Token<ExtensionInterface>();

@Service({tags: [Extension]})
class Extension1 implements ExtensionInterface {
  name: string = "Extension 1";
}

@Service({tags: [Extension]})
class Extension2 implements ExtensionInterface {
  name: string = "Extension 2";
}

class TargetClass {
  @InjectTagged(Extension)
  private extensions: ExtensionInterface[];

  public logExtensions() {
    for (const extension of this.extensions)
      console.log(extension.name);
  }
}

Container.get(TargetClass).logExtensions();