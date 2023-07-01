namespace Interpreter {
    interface Object {
    }
}


export class Interpreter {
    constructor(code: string | any, initFunc?: (interpreter: Interpreter, globalObject: Window) => void);
    createNativeFunction(nativeFunc: Function, isConstructor?: boolean): Interpreter.Object;
    setProperty(obj: Object, prop: string, nativeFunc: Interpreter.Object): void;
    step(): boolean;
    run(): boolean;
}
