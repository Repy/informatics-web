/**
 * @license
 * Copyright (c) 2023 Reiji Terasaka
 * SPDX-License-Identifier: MIT
 */

import { BlocklyToolkit } from "./core";
import { Dialog } from "./dialog";
import { UDFontTheme } from "./theme";
import { CE } from "./util";

export type BlocklyToolkitViewSetting = {
    OutputJavaScript?: boolean;
};
export class BlocklyToolkitView {
    constructor(el: HTMLElement, toolboxJson: any, setting?: BlocklyToolkitViewSetting) {
        let outputData: string = "";

        const blocklyDiv = CE("div", {
            "class": "BlocklyToolkitViewBlockly",
        });
        const output = CE("textarea", {
            "class": "BlocklyToolkitViewSideOutput",
            "readonly":"readonly",
        });
        el.appendChild(
            CE("div", {
                "class": "BlocklyToolkitView",
            }, [
                blocklyDiv,
                CE("div", {
                    "class": "BlocklyToolkitViewSide",
                }, [
                    CE("div", {
                        "class": "BlocklyToolkitViewSideSpeed",
                    }, [
                        CE("label", {}, ["実行速度"]),
                        CE("input", {
                            "class": "BlocklyToolkitViewSideSpeedInput",
                            "type": "range",
                            "min": "10",
                            "max": "1000",
                            "value": "500",
                        }, [], {
                            change: function (e) {
                                toolkit.setSleepTime(this.valueAsNumber);
                            }
                        }),
                    ]),
                    CE("div", {
                        "class": "BlocklyToolkitViewSideToolbar",
                    }, [
                        CE("button", {
                            "class": "BlocklyToolkitViewSideToolbarButton",
                            "type": "button",
                        }, ["実行"], {
                            click: (e) => {
                                toolkit.run();
                            }
                        }),
                        CE("button", {
                            "class": "BlocklyToolkitViewSideToolbarButton",
                            "type": "button",
                        }, ["停止"], {
                            click: (e) => {
                                toolkit.stop();
                            }
                        }),
                    ]),
                    output,
                    CE("div", {
                        "class": "BlocklyToolkitViewSideToolbar",
                    }, [
                        CE("button", {
                            "class": "BlocklyToolkitViewSideToolbarButton",
                            "type": "button",
                        }, ["保存"], {
                            click: (e) => {
                                toolkit.save();
                            }
                        }),
                        CE("button", {
                            "class": "BlocklyToolkitViewSideToolbarButton",
                            "type": "button",
                        }, ["読込"], {
                            click: (e) => {
                                toolkit.load();
                            }
                        }),
                        (setting?.OutputJavaScript && CE("button", {
                            "class": "BlocklyToolkitViewSideToolbarButton",
                            "type": "button",
                        }, ["コード"], {
                            click: (e) => {
                                const code = toolkit.getCode("");
                                Dialog(code);
                            }
                        }))
                    ]),
                ])
            ])
        );

        const toolkit = new BlocklyToolkit(blocklyDiv, toolboxJson, UDFontTheme);


        toolkit.addEventListener("console", (log) => {
            outputData += log + "\n";
            output.value = outputData;
        });

        toolkit.addEventListener("changestate", (state) => {
            if (state === "runnning") {
                outputData = "";
                output.value = outputData;
            }
        });

    }
}
