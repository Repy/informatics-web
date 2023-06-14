/**
 * @license
 * Copyright (c) 2023 Reiji Terasaka
 * SPDX-License-Identifier: MIT
 */

import Blockly from "blockly";
import { } from 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as JA from 'blockly/msg/ja';
import { Interpreter } from "./interpreter/interpreter";

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

async function sleep(sleepTime: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, sleepTime);
    });
};

export class BlocklyToolkit {
    private workspace: Blockly.WorkspaceSvg;
    constructor(view: Element | string, toolboxJson: any, theme: Blockly.Theme) {
        this.workspace = Blockly.inject(view, {
            toolbox: toolboxJson,
            theme: theme,
        });
        javascriptGenerator.addReservedWords('highlightBlock');
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
        let pause = false;
        const myInterpreter = new Interpreter(code, (interpreter: any, globalObject: Window) => {
            const wrapperAlert = (msg: string) => {
                this.dispatchEvent("console", msg);
            };
            interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction(wrapperAlert));

            const wrapperPrompt = (msg: string) => {
                return window.prompt(msg);
            };
            interpreter.setProperty(globalObject, 'prompt', interpreter.createNativeFunction(wrapperPrompt));

            // Add an API function for highlighting blocks.
            const wrapperHighlight = (id: string) => {
                this.highlightBlock(id);
                pause = true;
            };
            interpreter.setProperty(globalObject, 'highlightBlock', interpreter.createNativeFunction(wrapperHighlight));
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
                if (pause) {
                    pause = false;
                    await this.sleep();
                    if (!this.isRunnning) {
                        this.dispatchEvent("console", "強制終了");
                        break;
                    }
                }
            }
            await this.sleep();
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

    private sleep() {
        return sleep(this.sleepTime);
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
