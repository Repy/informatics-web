import Blockly from "blockly";
import HighContrastTheme from "@blockly/theme-highcontrast";

export const UDFontTheme = Blockly.Theme.defineTheme('UDFontTheme', {
    name: "UDFontTheme",
    base: HighContrastTheme,
    fontStyle: {
        family: '"Local BIZ UDPGothic", "BIZ UDPGothic", sans-serif',
        weight: '700',
        size: 10,
    },
});
