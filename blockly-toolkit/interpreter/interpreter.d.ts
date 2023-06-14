
export class Interpreter {
    constructor(code: string | any, opt_initFunc?: Function | undefined);
    step(): boolean;
    run(): boolean;
}
