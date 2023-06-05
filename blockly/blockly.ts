/// <reference path="./blockly.d.ts" />

import { WorkspaceSvg } from "blockly";

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
    private workspace: WorkspaceSvg;
    constructor(divId: string, toolboxJson: any) {
        this.workspace = Blockly.inject('blocklyDiv', {
            toolbox: toolboxJson,
        });
        Blockly.JavaScript.addReservedWords('highlightBlock');
        Blockly.JavaScript.addReservedWords('checkStop');
        Blockly.JavaScript.addReservedWords('sleep');
        Blockly.JavaScript.addReservedWords('console2');


    }
    private highlightBlock(id: string | null) {
        this.workspace.highlightBlock(id);
    };

    private output: HTMLTextAreaElement | null = null;
    private setOutput(output: HTMLTextAreaElement | null) {
        this.output = output;
    }

    private outputData = "";
    private console(msg: string) {
        this.outputData += msg + "\n";
        if (this.output) {
            this.output.value = this.outputData;
        }
    }

    public async run() {
        const checkStop = () => {
            this.checkStop();
        }
        const sleep = () => {
            return this.sleep(500);
        }
        const highlightBlock = (id: string) => {
            return this.highlightBlock(id);
        }
        const consolelog = (msg: string) => {
            return this.console(msg);
        }
        try {
            Blockly.JavaScript.STATEMENT_PREFIX = "checkStop();\nawait sleep();\nhighlightBlock(%1);\n";
            var code = Blockly.JavaScript.workspaceToCode(this.workspace);
            code = code.replace(/console\.log\(/g, 'consolelog(');
            this.isStop = false;
            this.highlightBlock(null);
            await eval("(async ()=>{" + code + "})();");
        } catch (e) {
            alert(e);
        }
    }
    private isStop = false;
    private checkStop() {
        if (this.isStop)
            throw "停止しました";
    }
    private stop() {
        this.isStop = true;
    }
    private sleep(msec: number) {
        return new Promise<void>((resolve, reject) => {
            if (msec) {
                setTimeout(() => {
                    resolve();
                }, msec);
            } else {
                reject("invalid msec.");
            }
        });
    };

    private async save() {
        const text = JSON.stringify(Blockly.serialization.workspaces.save(this.workspace));
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
    };
    
    private async load() {
        const handle = await window.showOpenFilePicker(options);
        const file = await handle[0].getFile();
        const text = JSON.parse(await file.text());
        Blockly.serialization.workspaces.load(text, this.workspace);
    };
}
