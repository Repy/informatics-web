import Blockly from "blockly";
import { } from 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as JA from 'blockly/msg/ja';

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

interface BlocklyToolkitEventMap {
    "console": string;
    "changestate": "runnning" | "stopped";
}

interface BlocklyToolkitEventListener<K extends keyof BlocklyToolkitEventMap> {
    type: K;
    listener: (this: BlocklyToolkit, ev: BlocklyToolkitEventMap[K]) => void;
}

export class BlocklyToolkit {
    private workspace: Blockly.WorkspaceSvg;
    constructor(view: Element | string, toolboxJson: any, theme: Blockly.Theme) {
        this.workspace = Blockly.inject(view, {
            toolbox: toolboxJson,
            theme: theme,
        });
        javascriptGenerator.addReservedWords('highlightBlock');
        javascriptGenerator.addReservedWords('checkStop');
        javascriptGenerator.addReservedWords('sleep');
        javascriptGenerator.addReservedWords('console2');
        Blockly.setLocale(JA);

    }
    private highlightBlock(id: string | null) {
        this.workspace.highlightBlock(id);
    };

    private listeners: BlocklyToolkitEventListener<any>[] = [];
    public addEventListener<K extends keyof BlocklyToolkitEventMap>(type: K, listener: (this: BlocklyToolkit, ev: BlocklyToolkitEventMap[K]) => void): void {
        this.listeners.push({ type: type, listener: listener });
    }
    private dispatchEvent<K extends keyof BlocklyToolkitEventMap>(type: K, ev: BlocklyToolkitEventMap[K]): void {
        for (const listener of this.listeners) {
            if (listener.type === type) {
                listener.listener.call(this, ev);
            }
        }
    }

    private sleepTime: number = 500;
    public setSleepTime(sleepTime: number) {
        this.sleepTime = sleepTime;
    }

    public getCode(statementPrefix: string) {
        javascriptGenerator.STATEMENT_PREFIX = statementPrefix;
        return javascriptGenerator.workspaceToCode(this.workspace);
    }

    public async run() {
        if (this.isRunnning) return;
        const sleep = () => {
            return this.sleep();
        }
        const highlightBlock = (id: string) => {
            this.highlightBlock(id);
        }
        const consolelog = (msg: string) => {
            this.dispatchEvent("console", msg);
        }
        var code = this.getCode("await sleep();\nhighlightBlock(%1);\n");
        code = code.replace(/window\.alert\(/g, 'consolelog(');
        this.highlightBlock(null);
        consolelog("実行開始");
        this.isRunnning = true;
        try {
            await eval("(async ()=>{" + code + "})();");
        } catch (e) {
            alert(e);
        }
        this.isRunnning = false;
        this.highlightBlock(null);
        consolelog("実行終了");
    }

    private isRunnning = false;
    public stop() {
        this.isRunnning = false;
    }

    private sleep() {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (!this.isRunnning) {
                    reject("停止しました")
                } else {
                    resolve();
                }
            }, this.sleepTime);
        });
    };

    public async save() {
        const text = JSON.stringify(Blockly.serialization.workspaces.save(this.workspace));
        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
    };

    public async load() {
        const handle = await window.showOpenFilePicker(options);
        const file = await handle[0].getFile();
        const text = JSON.parse(await file.text());
        Blockly.serialization.workspaces.load(text, this.workspace);
    };
}
