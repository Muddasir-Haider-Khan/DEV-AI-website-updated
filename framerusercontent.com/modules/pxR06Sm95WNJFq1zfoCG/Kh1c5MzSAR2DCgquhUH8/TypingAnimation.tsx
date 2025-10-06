import { Typewriter } from "react-simple-typewriter"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
/*
 * Typing Animation
 * By Kanishak M
 * Library Used : react-simple-typewriter
 * @framerDisableUnlink
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function TypingAnimation(props) {
    const {
        typeSpeed,
        deleteSpeed,
        text,
        font,
        RepeatType,
        RepeatValue,
        showCursor,
        delay,
        cursorStyle,
    } = props
    const defaultWordProps = ["Eat", "Sleep", "Code", "Repeat"]
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    return (
        <span
            style={{
                ...font.font,
                color: font.color,
                display: "flex",
                alignItems: font.alignItems,
                justifyContent: font.justifyContent,
                padding: font.padding,
                width: "100%",
                height: "100%",
                position: "relative",
            }}
        >
            <Typewriter
                words={!text.length ? defaultWordProps : text}
                loop={RepeatType ? 0 : RepeatValue}
                cursor={showCursor}
                cursorStyle={cursorStyle.text}
                cursorColor={cursorStyle.color}
                cursorBlinking={cursorStyle.blinking}
                typeSpeed={typeSpeed}
                deleteSpeed={deleteSpeed}
                delaySpeed={delay}
            />
        </span>
    )
}
addPropertyControls(TypingAnimation, {
    text: {
        title: "Words",
        type: ControlType.Array,
        control: {
            type: ControlType.String,
            defaultValue: "Typing String",
        },
        defaultValue: ["Eat", "Sleep", "Code", "Repeat"],
    },
    font: {
        type: ControlType.Object,
        controls: {
            font: {
                type: ControlType.Font,
                controls: "extended",
                title: "Font",
            },
            color: {
                type: ControlType.Color,
                defaultValue: "#000000",
            },
            padding: { type: ControlType.Padding, defaultValue: "10" },
            alignItems: {
                type: ControlType.Enum,
                displaySegmentedControl: true,
                title: "alignItems",
                options: ["start", "center", "end"],
                optionTitles: ["Left", "Center", "Right"],
                defaultValue: "center",
            },
            justifyContent: {
                type: ControlType.Enum,
                displaySegmentedControl: true,
                title: "justifyContent",
                options: ["left", "center", "right"],
                optionTitles: ["Left", "Center", "Right"],
                defaultValue: "center",
            },
        },
    },
    showCursor: {
        type: ControlType.Boolean,
        title: "Show Cursor",
        defaultValue: true,
    },
    cursorStyle: {
        type: ControlType.Object,
        title: "Cursor Style",
        hidden(props) {
            return props.showCursor === false
        },
        controls: {
            text: {
                title: "Cursor Text",
                type: ControlType.String,
                defaultValue: "!",
            },
            color: {
                title: "Cursor Color",
                type: ControlType.Color,
                defaultValue: "#000000",
            },
            blinking: {
                title: "Cursor Blinking",
                type: ControlType.Boolean,
                defaultValue: true,
            },
        },
    },

    RepeatType: {
        type: ControlType.Boolean,
        title: "RepeatType",
        enabledTitle: "Infinite",
        disabledTitle: "Specific",
        defaultValue: true,
    },
    RepeatValue: {
        type: ControlType.Number,
        displayStepper: true,
        hidden(props) {
            return props.RepeatType === true
        },
        defaultValue: 2,
    },
    typeSpeed: {
        title: "Type Speed",
        type: ControlType.Number,
        displayStepper: true,
        defaultValue: 50,
        description: "Character typing speed in Milliseconds",
    },
    deleteSpeed: {
        title: "Delete Speed",
        type: ControlType.Number,
        displayStepper: true,
        defaultValue: 50,
    },
    delay: {
        title: "Delay",
        type: ControlType.Number,
        displayStepper: true,
        defaultValue: 1000,
        description: "Delay time between the words in Milliseconds",
    },
})
