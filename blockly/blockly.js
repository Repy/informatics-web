"use strict";
/// <reference path="./blockly.d.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    types: [
        {
            description: "JSON",
            accept: {
                "application/json": [".json"],
            },
        },
    ],
};
class BlocklyToolkit {
    constructor(divId, toolboxJson) {
        this.output = null;
        this.outputData = "";
        this.isStop = false;
        this.workspace = Blockly.inject('blocklyDiv', {
            toolbox: toolboxJson,
        });
        Blockly.JavaScript.addReservedWords('highlightBlock');
        Blockly.JavaScript.addReservedWords('checkStop');
        Blockly.JavaScript.addReservedWords('sleep');
        Blockly.JavaScript.addReservedWords('console2');
    }
    highlightBlock(id) {
        this.workspace.highlightBlock(id);
    }
    ;
    setOutput(output) {
        this.output = output;
    }
    console(msg) {
        this.outputData += msg + "\n";
        if (this.output) {
            this.output.value = this.outputData;
        }
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const checkStop = () => {
                this.checkStop();
            };
            const sleep = () => {
                return this.sleep(500);
            };
            const highlightBlock = (id) => {
                return this.highlightBlock(id);
            };
            const consolelog = (msg) => {
                return this.console(msg);
            };
            try {
                Blockly.JavaScript.STATEMENT_PREFIX = "checkStop();\nawait sleep();\nhighlightBlock(%1);\n";
                var code = Blockly.JavaScript.workspaceToCode(this.workspace);
                code = code.replace(/console\.log\(/g, 'consolelog(');
                this.isStop = false;
                this.highlightBlock(null);
                yield eval("(async ()=>{" + code + "})();");
            }
            catch (e) {
                alert(e);
            }
        });
    }
    checkStop() {
        if (this.isStop)
            throw "停止しました";
    }
    stop() {
        this.isStop = true;
    }
    sleep(msec) {
        return new Promise((resolve, reject) => {
            if (msec) {
                setTimeout(() => {
                    resolve();
                }, msec);
            }
            else {
                reject("invalid msec.");
            }
        });
    }
    ;
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const text = JSON.stringify(Blockly.serialization.workspaces.save(this.workspace));
            const handle = yield window.showSaveFilePicker(options);
            const writable = yield handle.createWritable();
            yield writable.write(text);
            yield writable.close();
        });
    }
    ;
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const handle = yield window.showOpenFilePicker(options);
            const file = yield handle[0].getFile();
            const text = JSON.parse(yield file.text());
            Blockly.serialization.workspaces.load(text, this.workspace);
        });
    }
    ;
}
