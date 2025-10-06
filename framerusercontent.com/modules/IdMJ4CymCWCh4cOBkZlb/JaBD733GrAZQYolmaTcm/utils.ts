import { BorderStyle, Color, RenderTarget, clampRGB } from "framer"
import { useState, useMemo } from "react"
import {
    BorderProperties,
    BorderPropertiesOld,
    SupportedLanguages,
} from "./types.ts"

export function getFileExtensions(language: SupportedLanguages) {
    switch (language) {
        case "JavaScript":
            return ["js"]
        case "JSX":
            return ["jsx"]
        case "TypeScript":
            return ["ts"]
        case "TSX":
            return ["tsx"]
        case "CSS":
            return ["css"]
        case "SCSS":
            return ["scss"]
        case "Less":
            return ["less"]
        case "HTML":
            return ["html", "htm"]
        case "Angular":
            return ["ts"]
        case "C":
            return ["c"]
        case "C#":
            return ["cs"]
        case "C++":
            return ["cpp", "cxx", "cc", "h", "hpp"]
        case "Go":
            return ["go"]
        case "Haskell":
            return ["hs"]
        case "Java":
            return ["java"]
        case "Julia":
            return ["jl"]
        case "Kotlin":
            return ["kt", "kts"]
        case "Lua":
            return ["lua"]
        case "Markdown":
            return ["md"]
        case "MATLAB":
            return ["m"]
        case "Nginx":
            return ["conf"]
        case "Objective-C":
            return ["m", "mm"]
        case "Perl":
            return ["pl"]
        case "PHP":
            return ["php", "php4", "php5", "phtml"]
        case "Python":
            return ["py"]
        case "Ruby":
            return ["rb"]
        case "Rust":
            return ["rs"]
        case "Scala":
            return ["scala"]
        case "Shell":
            return ["sh"]
        case "SQL":
            return ["sql"]
        case "Swift":
            return ["swift"]
        case "Vue":
            return ["vue"]
        case "YAML":
            return ["yaml", "yml"]
        default:
            return []
    }
}

export function useBorder(
    props: Partial<BorderProperties | BorderPropertiesOld>,
    collapseEqualBorders: boolean = true
) {
    const style: React.CSSProperties = {}

    const {
        borderWidth = 0,
        borderColor = "unset",
        borderStyle = "none",
        borderBottomWidth = 0,
        borderLeftWidth = 0,
        borderRightWidth = 0,
        borderTopWidth = 0,
    } = normalizeBorderProperties(props)

    const isMixedBorderWidth =
        borderTopWidth !== borderBottomWidth ||
        borderTopWidth !== borderLeftWidth ||
        borderTopWidth !== borderRightWidth

    let borderTop: number
    let borderBottom: number
    let borderLeft: number
    let borderRight: number
    if (!isMixedBorderWidth) {
        borderTop = borderBottom = borderLeft = borderRight = borderWidth
    } else {
        borderTop = borderTopWidth
        borderRight = borderRightWidth
        borderBottom = borderBottomWidth
        borderLeft = borderLeftWidth
    }

    if (
        collapseEqualBorders &&
        borderTop === borderBottom &&
        borderTop === borderLeft &&
        borderTop === borderRight
    ) {
        style.border = `${borderTop}px ${borderStyle} ${borderColor}`
    } else {
        style.borderStyle = borderStyle
        style.borderColor = borderColor
        style.borderTopWidth = `${borderTop}px`
        style.borderBottomWidth = `${borderBottom}px`
        style.borderLeftWidth = `${borderLeft}px`
        style.borderRightWidth = `${borderRight}px`
    }

    return style
}

function normalizeBorderProperties(
    border: Partial<BorderProperties | BorderPropertiesOld>
): Partial<BorderProperties> {
    const normalizedProps: Partial<BorderProperties> = {
        borderWidth: border.borderWidth,
        borderColor: border.borderColor,
        borderStyle: border.borderStyle,
    }

    if (
        "borderBottomWidth" in border ||
        "borderLeftWidth" in border ||
        "borderRightWidth" in border ||
        "borderTopWidth" in border
    ) {
        normalizedProps.borderBottomWidth = border.borderBottomWidth
        normalizedProps.borderLeftWidth = border.borderLeftWidth
        normalizedProps.borderRightWidth = border.borderRightWidth
        normalizedProps.borderTopWidth = border.borderTopWidth
    } else if (
        "borderWidthBottom" in border ||
        "borderWidthLeft" in border ||
        "borderWidthRight" in border ||
        "borderWidthTop" in border
    ) {
        normalizedProps.borderBottomWidth = border.borderWidthBottom
        normalizedProps.borderLeftWidth = border.borderWidthLeft
        normalizedProps.borderRightWidth = border.borderWidthRight
        normalizedProps.borderTopWidth = border.borderWidthTop
    }

    return normalizedProps
}

// Chunks a string into meaningful groups of characters (words, acronyms or numbers)
const groupsRegex = /[A-Z]{2,}|[A-Z][a-z]+|[a-z]+|[A-Z]|\d+/gu
function capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}
export function titleCase(value: string): string {
    const groups = value.match(groupsRegex) || []

    return groups.map(capitalizeFirstLetter).join(" ")
}

export function useRadius(props) {
    const {
        borderRadius,
        isMixedBorderRadius,
        topLeftRadius,
        topRightRadius,
        bottomRightRadius,
        bottomLeftRadius,
    } = props

    const radiusValue = useMemo(
        () =>
            isMixedBorderRadius
                ? `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`
                : `${borderRadius}px`,
        [
            borderRadius,
            isMixedBorderRadius,
            topLeftRadius,
            topRightRadius,
            bottomRightRadius,
            bottomLeftRadius,
        ]
    )

    return radiusValue
}

export function usePadding(props) {
    const {
        padding,
        paddingBottom,
        paddingLeft,
        paddingPerSide,
        paddingRight,
        paddingTop,
    } = props

    const paddingValue = useMemo(
        () =>
            paddingPerSide
                ? `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
                : `${padding}px`,
        [
            padding,
            paddingBottom,
            paddingLeft,
            paddingPerSide,
            paddingRight,
            paddingTop,
        ]
    )
    return paddingValue
}

export function useIsOnCanvas() {
    const [onCanvas] = useState(
        () => RenderTarget.current() === RenderTarget.canvas
    )
    return onCanvas
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object"
}

// From https://github.com/codesandbox/sandpack/blob/36560cb4f0fc8f5f8b18f5a3d3952799690eba77/sandpack-react/src/utils/stringUtils.ts#L81
export function isDarkColor(color: string): boolean {
    let r = 0
    let g = 0
    let b = 0
    if (color.startsWith("#")) {
        if (color.length < 7) {
            return true
        }

        r = parseInt(color.substr(1, 2), 16)
        g = parseInt(color.substr(3, 2), 16)
        b = parseInt(color.substr(5, 2), 16)
    } else {
        color = Color.isP3String(color) ? clampRGB(color) : color
        const rgbValues = color
            .replace("rgb(", "")
            .replace("rgba(", "")
            .replace(")", "")
            .split(",")
        if (rgbValues.length < 3) {
            return true
        }

        r = parseInt(rgbValues[0], 10)
        g = parseInt(rgbValues[1], 10)
        b = parseInt(rgbValues[2], 10)
    }

    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq < 128
}
