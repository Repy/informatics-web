/**
 * @license
 * Copyright (c) 2023 Reiji Terasaka
 * SPDX-License-Identifier: MIT
 */

import Blockly from "blockly";
import { BlocklyToolkitCustomBlock } from "../../blockly-toolkit/core";
export { BlocklyToolkitView } from "../../blockly-toolkit";

declare global {
    interface Window {
        userButtonInput: string | null;
    }
}

window.userButtonInput = "";
const comImg = <HTMLImageElement>document.getElementById("comImg");
const userImg = <HTMLImageElement>document.getElementById("userImg");
const button1 = <HTMLButtonElement>document.getElementById("button1");
const button2 = <HTMLButtonElement>document.getElementById("button2");
const button3 = <HTMLButtonElement>document.getElementById("button3");
button1.addEventListener("click", () => {
    window.userButtonInput = "GU";
});
button2.addEventListener("click", () => {
    window.userButtonInput = "CHOKI";
});
button3.addEventListener("click", () => {
    window.userButtonInput = "PA";
});

export const CustomBlock: BlocklyToolkitCustomBlock[] = [
    {
        name: "janken_rand",
        init() {
            this.appendDummyInput()
                .appendField("ランダムで手を決定する");
            this.setOutput(true, "String");
            this.setColour(230);
            this.setTooltip("");
            this.setHelpUrl("");
        },
        codeGenerator(block, generator) {
            console.log("aaa");
            return [`(function(){
            switch (Math.floor(Math.random() * 3)) {
                case 0:
                    return "GU";
                case 1:
                    return "CHOKI";
                case 2:
                    return "PA";
                default:
                    throw "Other";
            }
        })()`, generator.ORDER_ADDITION];
        },
        interpreterInitFunc(interpreter, globalObject) {

        },
    },
    {
        name: "janken_user",
        init() {
            this.appendDummyInput()
                .appendField("ボタン入力を受け付ける");
            this.setOutput(true, "String");
            this.setColour(230);
            this.setTooltip("");
            this.setHelpUrl("");
        },
        codeGenerator(block, generator) {
            return [`(function(){
            while (true) {
                window.sleepFunc();
                var userButtonInputAAA = window.getUserButtonInput();
                if (userButtonInputAAA !== "") return userButtonInputAAA;
            }
        })()`, generator.ORDER_ADDITION];
        },
        interpreterInitFunc(interpreter, globalObject, context) {
            window.userButtonInput = "";
            interpreter.setProperty(globalObject, "sleepFunc", interpreter.createNativeFunction(() => {
                context.sleepTime = 100;
            }));
            interpreter.setProperty(globalObject, "getUserButtonInput", interpreter.createNativeFunction(() => {
                return window.userButtonInput;
            }));
        },
    },
    {
        name: "janken_if",
        init() {
            this.appendDummyInput()
                .appendField("もし")
                .appendField(new Blockly.FieldVariable(null), "VAR")
                .appendField("が");
            this.appendStatementInput("IFGU")
                .setCheck(null)
                .appendField("グーならば");
            this.appendStatementInput("IFCHOKI")
                .setCheck(null)
                .appendField("チョキならば");
            this.appendStatementInput("IFPA")
                .setCheck(null)
                .appendField("パーならば");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(210);
            this.setTooltip("");
            this.setHelpUrl("");
        },
        codeGenerator(block, generator) {
            var variable_var = generator.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Names.NameType.VARIABLE);
            var statements_ifgu = generator.statementToCode(block, 'IFGU');
            var statements_ifchoki = generator.statementToCode(block, 'IFCHOKI');
            var statements_ifpa = generator.statementToCode(block, 'IFPA');
            return `;if (${variable_var} === "GU") {
                    ${statements_ifgu}
                } else if (${variable_var} === "CHOKI") {
                    ${statements_ifchoki}
                } else {
                    ${statements_ifpa}
                };`;
        },
        interpreterInitFunc(interpreter, globalObject, context) {
        },
    },
    {
        name: "janken_show_com",
        init() {
            this.appendValueInput("VAL")
                .setCheck("String")
                .appendField("上の画像に");
            this.appendDummyInput()
                .appendField("の絵を表示");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("");
            this.setHelpUrl("");
        },
        codeGenerator(block, generator) {
            var value_val = generator.valueToCode(block, 'VAL', generator.ORDER_ATOMIC);
            return `window.setComImgSrc(${value_val});`;
        },
        interpreterInitFunc(interpreter, globalObject, context) {
            interpreter.setProperty(globalObject, "setComImgSrc", interpreter.createNativeFunction((val: string) => {
                comImg.src = "./" + val + ".svg";
            }));
        },
    },
    {
        name: "janken_show_user",
        init() {
            this.appendValueInput("VAL")
                .setCheck("String")
                .appendField("下の画像に");
            this.appendDummyInput()
                .appendField("の絵を表示");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("");
            this.setHelpUrl("");
        },
        codeGenerator(block, generator) {
            var value_val = generator.valueToCode(block, 'VAL', generator.ORDER_ATOMIC);
            return `window.setUserImgSrc(${value_val});`;
        },
        interpreterInitFunc(interpreter, globalObject, context) {
            interpreter.setProperty(globalObject, "setUserImgSrc", interpreter.createNativeFunction((val: string) => {
                userImg.src = "./" + val + ".svg";
            }));
        },
    },
];
