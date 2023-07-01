
export function CE<T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    props: { [name: string]: string; },
    children?: (HTMLElement | string | null | undefined | false)[],
    event?: Partial<{ [K in keyof HTMLElementEventMap]: (this: HTMLElementTagNameMap[T], ev: HTMLElementEventMap[K]) => any }>,
): HTMLElementTagNameMap[T] {
    const tag = document.createElement(tagName);
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            tag.setAttribute(key, props[key]);
        }
    }
    if (children) {
        for (const e of children) {
            if (!e) continue;
            if ("string" === typeof e) {
                tag.appendChild(document.createTextNode(e));
            } else {
                tag.appendChild(e);
            }
        }
    }
    if (event) {
        for (const key in event) {
            if (Object.prototype.hasOwnProperty.call(event, key)) {
                const lis = (event as any)[key];
                tag.addEventListener(key, lis);
            }
        }
    }
    return tag;
}

export async function sleep(sleepTime: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, sleepTime);
    });
};
