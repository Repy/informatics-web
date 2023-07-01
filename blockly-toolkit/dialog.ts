import { CE } from "./util";



export function Dialog(text: string) {
    const textarea = CE("textarea", {
        "class": "BlocklyToolkitDialogGrow",
        "readonly": "readonly",
    },);
    textarea.value = text;
    const close = CE("button", {
        "class": "BlocklyToolkitDialogTool",
    }, ["閉じる"], {
        click: () => {
            document.body.removeChild(div);
        }
    });
    const div = CE("div", {
        "class": "BlocklyToolkitDialog",
    }, [
        textarea,
        close,
    ]);
    document.body.appendChild(div);
}
