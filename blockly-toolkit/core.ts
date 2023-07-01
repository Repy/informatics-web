/**
 * @license
 * Copyright (c) 2023 Reiji Terasaka
 * SPDX-License-Identifier: MIT
 */

import Blockly, { BlocklyOptions } from "blockly";
import { } from 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as JA from 'blockly/msg/ja';
import { Interpreter } from "./interpreter/interpreter";
import { sleep } from "./util";

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

export type BlocklyToolkitInterpreterContext = {
    sleepTime: number;
};
export type BlocklyToolkitCustomBlock = {
    name: string,
    init: (this: Blockly.Block) => void,
    codeGenerator: (block: Blockly.Block, generator: any) => string | [string, number],
    interpreterInitFunc: (interpreter: Interpreter, globalObject: Window, context: BlocklyToolkitInterpreterContext) => void,
};

export class BlocklyToolkit {
    private workspace: Blockly.WorkspaceSvg;
    private customBlock: BlocklyToolkitCustomBlock[];

    constructor(view: Element | string, toolboxJson: any, theme: Blockly.Theme, customBlock?: BlocklyToolkitCustomBlock[]) {
        Blockly.setLocale(JA);
        this.customBlock = customBlock || [];
        for (const b of this.customBlock) {
            Blockly.Blocks[b.name] = {
                init: b.init,
            };
            javascriptGenerator.forBlock[b.name] = b.codeGenerator;
        }
        this.workspace = Blockly.inject(view, {
            toolbox: toolboxJson,
            theme: theme,
            trashcan: true,
            scrollbars: true,
        });
        javascriptGenerator.addReservedWords('highlightBlock');
        javascriptGenerator.addReservedWords('sleepBlock');
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
                try {
                    listener.listener.call(this, ev);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    private sleepTime: number = 500;
    public setSleepTime(sleepTime: number) {
        this.sleepTime = sleepTime;
    }

    public getCode(statementPrefix: string): string {
        javascriptGenerator.STATEMENT_PREFIX = statementPrefix;
        return javascriptGenerator.workspaceToCode(this.workspace);
    }

    public async run() {
        if (this.isRunnning) return;
        var code = this.getCode("highlightBlock(%1);\n");
        const context: BlocklyToolkitInterpreterContext = { sleepTime: 0 };
        const myInterpreter = new Interpreter(code, (interpreter, globalObject) => {
            const wrapperAlert = (msg: string) => {
                this.dispatchEvent("console", msg);
            };
            interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction(wrapperAlert));

            const wrapperPrompt = (msg: string) => {
                return window.prompt(msg);
            };
            interpreter.setProperty(globalObject, 'prompt', interpreter.createNativeFunction(wrapperPrompt));

            const wrapperHighlight = (id: string) => {
                this.highlightBlock(id);
                context.sleepTime = this.sleepTime;
            };
            interpreter.setProperty(globalObject, 'highlightBlock', interpreter.createNativeFunction(wrapperHighlight));

            for (const b of this.customBlock) {
                b.interpreterInitFunc(interpreter, globalObject, context);
            }
        });
        this.highlightBlock(null);
        this.isRunnning = true;
        this.dispatchEvent("changestate", "runnning");
        this.dispatchEvent("console", "実行開始");
        try {
            while (true) {
                const next = myInterpreter.step();
                if (!next) {
                    break;
                }
                if (context.sleepTime > 0) {
                    await sleep(context.sleepTime);
                    context.sleepTime = 0;
                    if (!this.isRunnning) {
                        this.dispatchEvent("console", "強制終了");
                        break;
                    }
                }
            }
            await sleep(this.sleepTime);
        } catch (e) {
            alert(e);
        }
        this.dispatchEvent("console", "実行終了");
        this.highlightBlock(null);
        this.isRunnning = false;
        this.dispatchEvent("changestate", "stopped");
    }

    private isRunnning = false;
    public stop() {
        this.isRunnning = false;
    }

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
