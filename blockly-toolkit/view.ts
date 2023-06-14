/**
 * @license
 * Copyright (c) 2023 Reiji Terasaka
 * SPDX-License-Identifier: MIT
 */

import { BlocklyToolkit } from "./core";
import { UDFontTheme } from "./theme";

export class BlocklyToolkitView {
    private readonly root: HTMLDivElement;
    private readonly blockly: HTMLDivElement;
    private readonly side: HTMLDivElement;
    private readonly speed: HTMLLabelElement;
    private readonly speedinput: HTMLInputElement;
    private readonly run: HTMLButtonElement;
    private readonly stop: HTMLButtonElement;
    private readonly save: HTMLButtonElement;
    private readonly load: HTMLButtonElement;
    private readonly toolkit: BlocklyToolkit;
    private readonly output: HTMLTextAreaElement;
    private outputData: string = "";
    constructor(el: HTMLElement, toolboxJson: any) {
        this.root = document.createElement("div");
        this.root.classList.add("BlocklyToolkitView");
        this.blockly = document.createElement("div");
        this.blockly.classList.add("BlocklyToolkitViewBlockly");
        this.side = document.createElement("div");
        this.side.classList.add("BlocklyToolkitViewSide");
        this.speed = document.createElement("label");
        this.speed.textContent = "実行速度";
        this.speed.classList.add("BlocklyToolkitViewSideSpeed");
        this.speedinput = document.createElement("input");
        this.speedinput.type = "range";
        this.speedinput.min = "10";
        this.speedinput.max = "1000";
        this.speedinput.classList.add("BlocklyToolkitViewSideSpeedInput");
        this.run = document.createElement("button");
        this.run.textContent = "実行";
        this.run.classList.add("BlocklyToolkitViewSideRun");
        this.stop = document.createElement("button");
        this.stop.textContent = "停止";
        this.stop.classList.add("BlocklyToolkitViewSideStop");
        this.output = document.createElement("textarea");
        this.output.readOnly = true;
        this.output.classList.add("BlocklyToolkitViewSideOutput");
        this.save = document.createElement("button");
        this.save.textContent = "保存";
        this.save.classList.add("BlocklyToolkitViewSideSave");
        this.load = document.createElement("button");
        this.load.textContent = "読込";
        this.load.classList.add("BlocklyToolkitViewSideLoad");
        this.root.appendChild(this.blockly);
        this.root.appendChild(this.side);
        this.side.appendChild(this.speed);
        this.speed.appendChild(this.speedinput);
        this.side.appendChild(this.run);
        this.side.appendChild(this.stop);
        this.side.appendChild(this.output);
        this.side.appendChild(this.save);
        this.side.appendChild(this.load);
        el.appendChild(this.root);

        this.toolkit = new BlocklyToolkit(this.blockly, toolboxJson, UDFontTheme);

        this.toolkit.addEventListener("console", (log) => {
            this.outputData += log + "\n";
            this.output.value = this.outputData;
        });
        this.toolkit.addEventListener("changestate", (state) => {
            if (state === "runnning") {
                this.outputData = "";
                this.output.value = this.outputData;
            }
        });

        this.speedinput.valueAsNumber = 500;
        this.toolkit.setSleepTime(this.speedinput.valueAsNumber);
        this.speedinput.addEventListener("change", () => {
            this.toolkit.setSleepTime(this.speedinput.valueAsNumber);
        }, false);

        this.stop.addEventListener("click", () => {
            this.toolkit.stop();
        }, false);

        this.run.addEventListener("click", () => {
            this.toolkit.run();
        }, false);

        this.save.addEventListener("click", () => {
            this.toolkit.save();
        }, false);

        this.load.addEventListener("click", () => {
            this.toolkit.load();
        }, false);
    }
}
