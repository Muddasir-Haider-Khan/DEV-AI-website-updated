import { motion, Variants } from "framer-motion"
import {
    getSandpackCssText,
    SandpackCodeEditor,
    SandpackLayout,
    SandpackProvider,
} from "./modules/codesandbox_sandpack_react.js"
import { addPropertyControls, ControlType, RenderTarget, withCSS } from "framer"
import { isBrowser } from "./lib/browser.ts"
import {
    BorderProperties,
    BorderPropertiesOld,
    BorderRadiusProperties,
    supportedLanguages,
    SupportedLanguages,
    FontProperties,
    PaddingProperties,
} from "./lib/types.ts"
import { useLanguageAsync } from "./lib/useLanguageAsync.tsx"
import {
    getFileExtensions,
    titleCase,
    useBorder,
    useIsOnCanvas,
    usePadding,
    useRadius,
} from "./lib/utils.ts"
import {
    darkThemeVariables,
    getVariablesForTheme,
    getVariableTheme,
    lightThemeVariables,
    themes,
    themeKeys,
    ThemeKeys,
} from "./lib/theming.ts"

const DEFAULT_CODE = `// Paste a code snippet
import { motion } from "framer-motion";

function Component() {
    return (
        <motion.div
            transition={{ ease: "linear" }}
            animate={{ rotate: 360, scale: 2 }}
        />
    );
}`

const wrapperClassName = "framer-cb"

const css = [
    `
.${wrapperClassName} .sp-pre-placeholder {
    padding: var(--cb-padding) !important;
    padding-left: calc(var(--cb-padding) + var(--sp-space-1, 0)) !important;
    margin: 0 !important;
    width: max-content;
}
    `,
    `
.${wrapperClassName} .cm-scroller {
    display: unset !important;
    padding: 0 !important;
}
    `,
    `
.${wrapperClassName} .cm-content {
    padding: var(--cb-padding) !important;
    width: max-content;
}
    `,
    `
.${wrapperClassName} .sp-wrapper {
    color-scheme: var(--cb-color-scheme, inherit);
}
    `,
    // This override rules to fix font-size on mobile safari.
    // .cm-content is rendered with js enabled
    // .sp-pre-placeholder is rendered in no-js mode (SSG output)
    `
@media screen and (max-width: 768px) {
    @supports (-webkit-overflow-scrolling: touch) {
        .cb-code-editor .cm-content,
        .cb-code-editor .sp-pre-placeholder {
            font-size: var(--sp-font-size, inherit);
            -webkit-text-size-adjust: 100%;
        }
    }
}
`,
    // Override the 50% height on small screens
    `
@media screen and (max-width: 768px) {
    .${wrapperClassName} .sp-editor-viewer.sp-stack {
        height: 100%;
    }
}
`,
    // Light mode
    `
.${wrapperClassName} {
    ${lightThemeVariables}
}
    `,
    `
body[data-framer-theme="dark"] .${wrapperClassName} {
    ${darkThemeVariables}
}
    `,
    `
@media (prefers-color-scheme: dark) {
    body:not([data-framer-theme]) .${wrapperClassName} {
        ${darkThemeVariables}
    }
}
    `,
    `
@supports not (color: color(display-p3 1 1 1)) {
    :root {
        --cb-custom-background: var(--cb-background-rgb)
    }
}
    `,
].map((rule) => rule.trim())

interface CodeBlockProps extends BorderRadiusProperties, PaddingProperties {
    code: string
    themeMode: "Static" | "Dynamic"
    theme: ThemeKeys
    lightTheme: ThemeKeys
    darkTheme: ThemeKeys
    style: React.CSSProperties
    language: SupportedLanguages
    font: FontProperties
    border?: Partial<BorderProperties | BorderPropertiesOld>
    background: string
}

/**
 * Code Block
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight any
 *
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 500
 * @framerIntrinsicHeight 200
 *
 * @framerComponentPresetProps borderRadius, border, font, themeMode, theme, lightTheme, darkTheme, background, padding
 */
const CodeBlock: React.ComponentType<CodeBlockProps> = withCSS(
    function CodeBlock(props) {
        const {
            code,
            themeMode,
            theme,
            lightTheme,
            darkTheme,
            style,
            language,
            font,
            border,
            background,
        } = props

        const variableTheme = getVariableTheme(font)
        const lightThemeVariables = getVariablesForTheme(
            themeMode === "Dynamic" ? lightTheme : theme,
            background,
            "light"
        )

        const darkThemeVariables = getVariablesForTheme(
            themeMode === "Dynamic" ? darkTheme : theme,
            background,
            "dark"
        )

        // async version
        const additionalLanguage = useLanguageAsync(language)
        // sync version
        // const additionalLanguage = getLanguage(language)
        const extension = getFileExtensions(language)[0]

        const onCanvas = useIsOnCanvas()

        const borderStyles: React.CSSProperties = useBorder(border || {}, false)
        const borderRadius = useRadius(props)
        const hasBorderRadius =
            borderRadius !== "0px 0px 0px 0px" && borderRadius !== "0px"
        const fileName = `example.${extension}`
        const padding = usePadding(props)

        return (
            <motion.div
                className={wrapperClassName}
                whileHover="visible"
                style={{
                    ...lightThemeVariables,
                    ...darkThemeVariables,
                    position: "relative",
                    width: "100%",
                    height: "100%",
                }}
            >
                <SandpackProvider
                    options={{
                        classes: {
                            "sp-code-editor": "cb-code-editor",
                        },
                    }}
                    theme={variableTheme}
                    files={{
                        [fileName]: code,
                    }}
                    customSetup={{
                        entry: fileName,
                    }}
                    style={{
                        height: "100%",
                    }}
                >
                    <SandpackLayout
                        style={
                            {
                                height: "100%",
                                // make sure the codeblock doesnt grow beyond
                                // the height of its contents
                                "--sp-layout-height": "100%",
                                // set the variables for padding we use in the overrides
                                "--cb-padding": `${padding}`,
                                ...borderStyles,
                                // match editor background color to make borders visually blend with the editor:
                                backgroundColor: "var(--sp-colors-surface1)",
                                borderRadius,
                                transform:
                                    // Safari sometimes struggles to render border-radius:
                                    // - on the canvas when changing from 0 to any other value
                                    // - or when rendering an iframe
                                    hasBorderRadius && onCanvas
                                        ? "translateZ(0.000001px)"
                                        : "unset",
                                overflow: "hidden",
                            } as React.CSSProperties
                        }
                    >
                        <SandpackCodeEditor
                            style={{
                                letterSpacing: font.letterSpacing,
                                fontStyle: font.fontStyle,
                                fontWeight: font.fontWeight,
                            }}
                            readOnly={true}
                            showReadOnly={false}
                            additionalLanguages={
                                additionalLanguage
                                    ? [additionalLanguage]
                                    : undefined
                            }
                        />
                        <SandpackStyles />
                    </SandpackLayout>
                </SandpackProvider>
            </motion.div>
        )
    },
    css,
    "framer-lib-codeblock"
)

export default CodeBlock

function SandpackStyles() {
    return (
        <div
            style={{ display: "contents" }}
            // This makes it so we load the CSS only once. If we were to SSR it per code-block, we could end up with multiple times the big Sandpack CSS on one page, which is more wasteful than just hoisting to the <head>. It gets de-duped during SSG.
            data-framer-css-ssr
            suppressHydrationWarning={true}
            // We wrap it like this because during SSG the style tag will be moved to the <head>. But during CSR we need to render it again.
            dangerouslySetInnerHTML={{
                __html: "<style>" + getSandpackCssText() + "</style>",
            }}
        />
    )
}

const themeNames = themeKeys.map(titleCase)

addPropertyControls(CodeBlock, {
    code: {
        type: ControlType.String,
        title: "Code",
        displayTextArea: true,
        defaultValue: DEFAULT_CODE,
    },
    themeMode: {
        type: ControlType.Enum,
        title: "Theme",
        displaySegmentedControl: true,
        options: ["Static", "Dynamic"],
        defaultValue: "Static",
    },
    theme: {
        type: ControlType.Enum,
        title: " ",
        options: [...themeKeys],
        optionTitles: themeNames,
        defaultValue: "framerDark",
        hidden: ({ themeMode }) => themeMode !== "Static",
    },
    lightTheme: {
        type: ControlType.Enum,
        title: "Light",
        options: [...themeKeys],
        optionTitles: themeNames,
        defaultValue: "framerLight",
        hidden: ({ themeMode }) => themeMode !== "Dynamic",
    },
    darkTheme: {
        type: ControlType.Enum,
        title: "Dark",
        options: [...themeKeys],
        optionTitles: themeNames,
        defaultValue: "framerDark",
        hidden: ({ themeMode }) => themeMode !== "Dynamic",
    },
    language: {
        type: ControlType.Enum,
        title: "Language",
        options: [...supportedLanguages],
        defaultValue: "JSX",
    },
    font: {
        // @ts-ignore: Internal API
        type: ControlType.Font,
        controls: "extended",
        displayFontSize: true,
        displayTextAlignment: false,
        defaultFontType: "monospace",
        defaultValue: {
            fontSize: 14,
            lineHeight: "1.5em",
        },
    },
    background: {
        title: "Fill",
        type: ControlType.Color,
        optional: true,
    },
    border: { type: ControlType.Border, optional: true },
    borderRadius: {
        title: "Radius",
        type: ControlType.FusedNumber,
        toggleKey: "isMixedBorderRadius",
        toggleTitles: ["Radius", "Radius per corner"],
        valueKeys: [
            "topLeftRadius",
            "topRightRadius",
            "bottomRightRadius",
            "bottomLeftRadius",
        ],
        valueLabels: ["TL", "TR", "BR", "BL"],
        min: 0,
        defaultValue: 15,
    },
    padding: {
        title: "Padding",
        type: ControlType.FusedNumber,
        toggleKey: "paddingPerSide",
        toggleTitles: ["Padding", "Padding per side"],
        valueKeys: [
            "paddingTop",
            "paddingRight",
            "paddingBottom",
            "paddingLeft",
        ],
        valueLabels: ["T", "R", "B", "L"],
        min: 0,
        defaultValue: 30,
    },
})

CodeBlock.displayName = "Code Block"
