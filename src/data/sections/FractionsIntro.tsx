import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineClozeInput,
    InlineFeedback,
    InlineSpotColor,
    InlineLinkedHighlight,
} from "@/components/atoms";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    clozePropsFromDefinition,
} from "../variables";
import { useVar, useSetVar } from "@/stores";
import { useEffect } from "react";

// ============================================
// PIZZA VISUALISATION COMPONENT
// ============================================
function PizzaVisualization({
    totalSlices,
    colouredSlices,
    size = 200,
}: {
    totalSlices: number;
    colouredSlices: number;
    size?: number;
}) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    // Unique ID for this pizza's pattern (to avoid conflicts when multiple pizzas on page)
    const patternId = `stripe-pattern-${size}-${totalSlices}`;

    // Generate pizza slices
    const slices = [];
    const anglePerSlice = (2 * Math.PI) / totalSlices;

    for (let i = 0; i < totalSlices; i++) {
        const startAngle = i * anglePerSlice - Math.PI / 2;
        const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArcFlag = anglePerSlice > Math.PI ? 1 : 0;

        const pathData = `
            M ${centerX} ${centerY}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;

        const isColoured = i < colouredSlices;

        slices.push(
            <path
                key={i}
                d={pathData}
                fill={isColoured ? `url(#${patternId})` : "#f8fafc"}
                stroke="#1e293b"
                strokeWidth="2"
                className="transition-all duration-300"
            />
        );
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Pattern definition for coloured slices - bold diagonal stripes for colour blind accessibility */}
            <defs>
                <pattern
                    id={patternId}
                    patternUnits="userSpaceOnUse"
                    width="10"
                    height="10"
                    patternTransform="rotate(45)"
                >
                    {/* Light stripe */}
                    <rect width="10" height="10" fill="#a7f3d0" />
                    {/* Dark bold stripe for high contrast */}
                    <rect x="0" y="0" width="5" height="10" fill="#047857" />
                </pattern>
            </defs>
            {/* Pizza base circle */}
            <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="#fef3c7"
                stroke="#1e293b"
                strokeWidth="3"
            />
            {/* Pizza slices */}
            {slices}
            {/* Outer black border circle */}
            <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
            />
            {/* Center dot */}
            <circle cx={centerX} cy={centerY} r="4" fill="#1e293b" />
        </svg>
    );
}

// ============================================
// REACTIVE PIZZA FOR SECTION 1
// ============================================
function ReactivePizzaIntro() {
    const total = useVar("pizzaSlicesTotal", 4) as number;
    const coloured = useVar("pizzaSlicesColoured", 1) as number;
    const setVar = useSetVar();

    // Ensure coloured doesn't exceed total
    useEffect(() => {
        if (coloured > total) {
            setVar("pizzaSlicesColoured", total);
        }
    }, [total, coloured, setVar]);

    return (
        <div className="flex flex-col items-center gap-4">
            <PizzaVisualization
                totalSlices={total}
                colouredSlices={Math.min(coloured, total)}
                size={220}
            />
            <div className="text-center text-lg font-medium text-slate-700">
                <span className="text-[#62D0AD]">{Math.min(coloured, total)}</span>
                <span className="mx-1">out of</span>
                <span className="text-[#8E90F5]">{total}</span>
                <span className="ml-1">slices</span>
            </div>
        </div>
    );
}

// ============================================
// FRACTION DISPLAY COMPONENT
// ============================================
function FractionDisplay({
    numerator,
    denominator,
    highlightPart,
    size = "large",
}: {
    numerator: number;
    denominator: number;
    highlightPart?: "numerator" | "denominator" | "";
    size?: "small" | "medium" | "large";
}) {
    const sizeClasses = {
        small: "text-2xl",
        medium: "text-4xl",
        large: "text-6xl",
    };

    return (
        <div className={`flex flex-col items-center ${sizeClasses[size]} font-bold`}>
            <div
                className={`transition-all duration-200 ${
                    highlightPart === "numerator"
                        ? "text-[#62D0AD] scale-110 bg-[rgba(98,208,173,0.15)] px-3 rounded"
                        : "text-[#62D0AD]"
                }`}
            >
                {numerator}
            </div>
            <div className="w-full h-1 bg-slate-400 my-1 rounded"></div>
            <div
                className={`transition-all duration-200 ${
                    highlightPart === "denominator"
                        ? "text-[#8E90F5] scale-110 bg-[rgba(142,144,245,0.15)] px-3 rounded"
                        : "text-[#8E90F5]"
                }`}
            >
                {denominator}
            </div>
        </div>
    );
}

// ============================================
// REACTIVE FRACTION WITH PIZZA FOR SECTION 2
// ============================================
function ReactiveFractionParts() {
    const numerator = useVar("numeratorExample", 3) as number;
    const denominator = useVar("denominatorExample", 4) as number;
    const highlight = useVar("fractionHighlight", "") as string;
    const setVar = useSetVar();

    // Ensure numerator doesn't exceed denominator
    useEffect(() => {
        if (numerator > denominator) {
            setVar("numeratorExample", denominator);
        }
    }, [numerator, denominator, setVar]);

    return (
        <div className="relative">
            <div className="flex items-center justify-center gap-8">
                <FractionDisplay
                    numerator={Math.min(numerator, denominator)}
                    denominator={denominator}
                    highlightPart={highlight as "numerator" | "denominator" | ""}
                    size="large"
                />
                <div className="text-4xl text-slate-400">=</div>
                <PizzaVisualization
                    totalSlices={denominator}
                    colouredSlices={Math.min(numerator, denominator)}
                    size={180}
                />
            </div>
            <InteractionHintSequence
                hintKey="fraction-parts-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the numbers to change",
                        position: { x: "20%", y: "30%" },
                    },
                ]}
            />
        </div>
    );
}

// ============================================
// HELPER: Greatest Common Divisor (for simplifying fractions)
// ============================================
function gcd(a: number, b: number): number {
    if (b === 0) return a;
    return gcd(b, a % b);
}

// ============================================
// HELPER: Get simplified fraction and special names
// ============================================
function getSimplifiedFraction(numerator: number, denominator: number): {
    simplifiedNum: number;
    simplifiedDen: number;
    isSimplified: boolean;
    specialName: string | null;
} {
    if (numerator === 0) {
        return { simplifiedNum: 0, simplifiedDen: 1, isSimplified: true, specialName: "zero" };
    }

    const divisor = gcd(numerator, denominator);
    const simplifiedNum = numerator / divisor;
    const simplifiedDen = denominator / divisor;
    const isSimplified = numerator === simplifiedNum && denominator === simplifiedDen;

    // Check for special names
    let specialName: string | null = null;
    if (simplifiedNum === simplifiedDen) {
        specialName = "one whole";
    } else if (simplifiedNum === 1 && simplifiedDen === 2) {
        specialName = "one half";
    } else if (simplifiedNum === 1 && simplifiedDen === 3) {
        specialName = "one third";
    } else if (simplifiedNum === 2 && simplifiedDen === 3) {
        specialName = "two thirds";
    } else if (simplifiedNum === 1 && simplifiedDen === 4) {
        specialName = "one quarter";
    } else if (simplifiedNum === 3 && simplifiedDen === 4) {
        specialName = "three quarters";
    }

    return { simplifiedNum, simplifiedDen, isSimplified, specialName };
}

// ============================================
// REACTIVE EXPLORER FOR SECTION 3
// ============================================
function ReactiveFractionExplorer() {
    const numerator = useVar("explorerNumerator", 2) as number;
    const denominator = useVar("explorerDenominator", 6) as number;
    const setVar = useSetVar();

    // Ensure numerator doesn't exceed denominator
    useEffect(() => {
        if (numerator > denominator) {
            setVar("explorerNumerator", denominator);
        }
    }, [numerator, denominator, setVar]);

    const actualNumerator = Math.min(numerator, denominator);
    const { simplifiedNum, simplifiedDen, isSimplified, specialName } = getSimplifiedFraction(actualNumerator, denominator);

    return (
        <div className="relative flex flex-col items-center gap-6 p-6 bg-white rounded-xl">
            <PizzaVisualization
                totalSlices={denominator}
                colouredSlices={actualNumerator}
                size={240}
            />
            <div className="flex items-center gap-4">
                <FractionDisplay
                    numerator={actualNumerator}
                    denominator={denominator}
                    size="medium"
                />
                {/* Show simplest form if different */}
                {!isSimplified && actualNumerator > 0 && (
                    <>
                        <div className="text-3xl text-slate-400">=</div>
                        <FractionDisplay
                            numerator={simplifiedNum}
                            denominator={simplifiedDen}
                            size="medium"
                        />
                    </>
                )}
            </div>
            {/* Description and special name */}
            <div className="text-center">
                <div className="text-slate-600 text-lg">
                    <span className="text-[#62D0AD] font-bold">{actualNumerator}</span> coloured{" "}
                    {actualNumerator === 1 ? "slice" : "slices"} out of{" "}
                    <span className="text-[#8E90F5] font-bold">{denominator}</span> total{" "}
                    {denominator === 1 ? "slice" : "slices"}
                </div>
                {/* Show special name or simplest form message */}
                {specialName && (
                    <div className="mt-2 text-lg font-medium text-[#F7B23B]">
                        That's {specialName}!
                    </div>
                )}
                {!isSimplified && !specialName && actualNumerator > 0 && (
                    <div className="mt-2 text-base text-slate-500">
                        Simplest form: {simplifiedNum}/{simplifiedDen}
                    </div>
                )}
            </div>
            <InteractionHintSequence
                hintKey="fraction-explorer-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the numbers in the text above",
                        position: { x: "50%", y: "85%" },
                    },
                ]}
            />
        </div>
    );
}

// ============================================
// QUIZ PIZZA (STATIC) FOR SECTION 4
// ============================================
function QuizPizza({ coloured, total }: { coloured: number; total: number }) {
    return (
        <div className="flex flex-col items-center">
            <PizzaVisualization totalSlices={total} colouredSlices={coloured} size={160} />
        </div>
    );
}

// ============================================
// SECTION 1: WHAT IS A FRACTION?
// ============================================
export const section1Blocks: ReactElement[] = [
    <StackLayout key="layout-fractions-title" maxWidth="xl">
        <Block id="fractions-title" padding="md">
            <EditableH1 id="h1-fractions-title" blockId="fractions-title">
                Introduction to Fractions
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-intro-heading" maxWidth="xl">
        <Block id="fractions-intro-heading" padding="sm">
            <EditableH2 id="h2-fractions-intro-heading" blockId="fractions-intro-heading">
                What is a Fraction?
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-intro-story" maxWidth="xl">
        <Block id="fractions-intro-story" padding="sm">
            <EditableParagraph id="para-fractions-intro-story" blockId="fractions-intro-story">
                Imagine you have a delicious pizza and you want to share it fairly with your
                friends. You cut the pizza into equal pieces so everyone gets the same amount.
                When we talk about how many pieces someone gets out of the total, we are using a{" "}
                <strong>fraction</strong>!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-fractions-pizza-demo" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="fractions-pizza-explanation" padding="sm">
                <EditableParagraph
                    id="para-fractions-pizza-explanation"
                    blockId="fractions-pizza-explanation"
                >
                    Here is a pizza cut into{" "}
                    <InlineScrubbleNumber
                        varName="pizzaSlicesTotal"
                        {...numberPropsFromDefinition(getVariableInfo("pizzaSlicesTotal"))}
                    />{" "}
                    equal slices. The green slices show how many pieces you take. Right now,{" "}
                    <InlineScrubbleNumber
                        varName="pizzaSlicesColoured"
                        {...numberPropsFromDefinition(getVariableInfo("pizzaSlicesColoured"))}
                    />{" "}
                    {" "}slices are coloured green.
                </EditableParagraph>
            </Block>
            <Block id="fractions-pizza-guidance" padding="sm">
                <EditableParagraph
                    id="para-fractions-pizza-guidance"
                    blockId="fractions-pizza-guidance"
                >
                    Try dragging the numbers to change how many slices the pizza has, and how many
                    are coloured. Watch how the pizza changes!
                </EditableParagraph>
            </Block>
        </div>
        <Block id="fractions-pizza-visual" padding="sm" hasVisualization>
            <ReactivePizzaIntro />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-fractions-meaning" maxWidth="xl">
        <Block id="fractions-meaning" padding="sm">
            <EditableParagraph id="para-fractions-meaning" blockId="fractions-meaning">
                A fraction tells us: <strong>"How many pieces do I have out of the total pieces?"</strong>{" "}
                It is a way of showing a part of something whole.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================
// SECTION 2: THE TWO PARTS OF A FRACTION
// ============================================
export const section2Blocks: ReactElement[] = [
    <StackLayout key="layout-fractions-parts-heading" maxWidth="xl">
        <Block id="fractions-parts-heading" padding="md">
            <EditableH2 id="h2-fractions-parts-heading" blockId="fractions-parts-heading">
                The Two Parts of a Fraction
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-parts-intro" maxWidth="xl">
        <Block id="fractions-parts-intro" padding="sm">
            <EditableParagraph id="para-fractions-parts-intro" blockId="fractions-parts-intro">
                Every fraction has two numbers, one on top and one on the bottom. Each number has
                a special name and tells us something different.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-fractions-parts-demo" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="fractions-numerator-explain" padding="sm">
                <EditableParagraph
                    id="para-fractions-numerator-explain"
                    blockId="fractions-numerator-explain"
                >
                    <InlineLinkedHighlight
                        varName="fractionHighlight"
                        highlightId="numerator"
                        color="#62D0AD"
                        bgColor="rgba(98, 208, 173, 0.15)"
                    >
                        <strong>The top number is called the NUMERATOR</strong>
                    </InlineLinkedHighlight>
                    . It tells us how many pieces we have or how many are coloured. Think of it as
                    the "counter" because it counts the pieces!
                </EditableParagraph>
            </Block>
            <Block id="fractions-denominator-explain" padding="sm">
                <EditableParagraph
                    id="para-fractions-denominator-explain"
                    blockId="fractions-denominator-explain"
                >
                    <InlineLinkedHighlight
                        varName="fractionHighlight"
                        highlightId="denominator"
                        color="#8E90F5"
                        bgColor="rgba(142, 144, 245, 0.15)"
                    >
                        <strong>The bottom number is called the DENOMINATOR</strong>
                    </InlineLinkedHighlight>
                    . It tells us how many equal parts the whole thing is divided into. It shows
                    how the pizza was cut!
                </EditableParagraph>
            </Block>
            <Block id="fractions-parts-interactive" padding="sm">
                <EditableParagraph
                    id="para-fractions-parts-interactive"
                    blockId="fractions-parts-interactive"
                >
                    In this fraction, the numerator is{" "}
                    <InlineScrubbleNumber
                        varName="numeratorExample"
                        {...numberPropsFromDefinition(getVariableInfo("numeratorExample"))}
                    />{" "}
                    and the denominator is{" "}
                    <InlineScrubbleNumber
                        varName="denominatorExample"
                        {...numberPropsFromDefinition(getVariableInfo("denominatorExample"))}
                    />
                    . Hover over the words above to see which part lights up!
                </EditableParagraph>
            </Block>
        </div>
        <Block id="fractions-parts-visual" padding="sm" hasVisualization>
            <ReactiveFractionParts />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-fractions-memory-tip" maxWidth="xl">
        <Block id="fractions-memory-tip" padding="sm">
            <EditableParagraph id="para-fractions-memory-tip" blockId="fractions-memory-tip">
                <strong>Memory tip:</strong> The{" "}
                <InlineSpotColor varName="numeratorExample" color="#62D0AD">
                    numerator
                </InlineSpotColor>{" "}
                is on top and sounds like "number" because it counts how many pieces you have. The{" "}
                <InlineSpotColor varName="denominatorExample" color="#8E90F5">
                    denominator
                </InlineSpotColor>{" "}
                is on the bottom and sounds like "down" because it goes down below!
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================
// SECTION 3: LET'S EXPLORE!
// ============================================
export const section3Blocks: ReactElement[] = [
    <StackLayout key="layout-fractions-explore-heading" maxWidth="xl">
        <Block id="fractions-explore-heading" padding="md">
            <EditableH2 id="h2-fractions-explore-heading" blockId="fractions-explore-heading">
                Let's Explore Fractions!
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-explore-intro" maxWidth="xl">
        <Block id="fractions-explore-intro" padding="sm">
            <EditableParagraph id="para-fractions-explore-intro" blockId="fractions-explore-intro">
                Now it's your turn to play with fractions! Use the numbers below to create
                different fractions and watch how the pizza changes.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-explore-controls" maxWidth="xl">
        <Block id="fractions-explore-controls" padding="sm">
            <EditableParagraph
                id="para-fractions-explore-controls"
                blockId="fractions-explore-controls"
            >
                Create your own fraction: colour{" "}
                <InlineScrubbleNumber
                    varName="explorerNumerator"
                    {...numberPropsFromDefinition(getVariableInfo("explorerNumerator"))}
                />{" "}
                slices out of{" "}
                <InlineScrubbleNumber
                    varName="explorerDenominator"
                    {...numberPropsFromDefinition(getVariableInfo("explorerDenominator"))}
                />{" "}
                total slices.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-explorer-visual" maxWidth="xl">
        <Block id="fractions-explorer-visual" padding="lg" hasVisualization>
            <ReactiveFractionExplorer />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-explore-questions" maxWidth="xl">
        <Block id="fractions-explore-questions" padding="sm">
            <EditableParagraph
                id="para-fractions-explore-questions"
                blockId="fractions-explore-questions"
            >
                <strong>Things to discover:</strong> Try making 3 out of 6 slices coloured.
                Notice how it shows "one half" because 3/6 is the same as 1/2! Can you find
                other fractions that equal one half? What happens when all the slices are coloured?
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================
// SECTION 4: CHECK YOUR UNDERSTANDING
// ============================================
export const section4Blocks: ReactElement[] = [
    <StackLayout key="layout-fractions-quiz-heading" maxWidth="xl">
        <Block id="fractions-quiz-heading" padding="md">
            <EditableH2 id="h2-fractions-quiz-heading" blockId="fractions-quiz-heading">
                Check Your Understanding
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-quiz-intro" maxWidth="xl">
        <Block id="fractions-quiz-intro" padding="sm">
            <EditableParagraph id="para-fractions-quiz-intro" blockId="fractions-quiz-intro">
                Great job learning about fractions! Let's see what you remember.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-question-numerator" maxWidth="xl">
        <Block id="fractions-question-numerator" padding="sm">
            <EditableParagraph
                id="para-fractions-question-numerator"
                blockId="fractions-question-numerator"
            >
                <strong>Question 1:</strong> In the fraction 2/5, what is the numerator (the top
                number)?{" "}
                <InlineFeedback
                    varName="answerNumeratorQuestion"
                    correctValue="2"
                    position="terminal"
                    successMessage="Well done! The numerator is 2, which tells us how many parts we have"
                    failureMessage="Not quite."
                    hint="The numerator is the number on top of the fraction"
                    reviewBlockId="fractions-numerator-explain"
                    reviewLabel="Review numerator"
                >
                    <InlineClozeInput
                        varName="answerNumeratorQuestion"
                        correctAnswer="2"
                        {...clozePropsFromDefinition(getVariableInfo("answerNumeratorQuestion"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-fractions-question-denominator" maxWidth="xl">
        <Block id="fractions-question-denominator" padding="sm">
            <EditableParagraph
                id="para-fractions-question-denominator"
                blockId="fractions-question-denominator"
            >
                <strong>Question 2:</strong> In the fraction 2/5, what is the denominator (the
                bottom number)?{" "}
                <InlineFeedback
                    varName="answerDenominatorQuestion"
                    correctValue="5"
                    position="terminal"
                    successMessage="Excellent! The denominator is 5, which tells us how many equal parts the whole is divided into"
                    failureMessage="Not quite."
                    hint="The denominator is the number below the line"
                    reviewBlockId="fractions-denominator-explain"
                    reviewLabel="Review denominator"
                >
                    <InlineClozeInput
                        varName="answerDenominatorQuestion"
                        correctAnswer="5"
                        {...clozePropsFromDefinition(getVariableInfo("answerDenominatorQuestion"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-fractions-question-visual" ratio="1:1" gap="lg">
        <Block id="fractions-question-visual-text" padding="sm">
            <EditableParagraph
                id="para-fractions-question-visual-text"
                blockId="fractions-question-visual-text"
            >
                <strong>Question 3:</strong> Look at this pizza. 3 slices are coloured green out of
                8 total slices. Write the fraction that shows this:{" "}
                <InlineFeedback
                    varName="answerFractionNumerator"
                    correctValue="3"
                    position="mid"
                >
                    <InlineClozeInput
                        varName="answerFractionNumerator"
                        correctAnswer="3"
                        {...clozePropsFromDefinition(getVariableInfo("answerFractionNumerator"))}
                    />
                </InlineFeedback>
                {" / "}
                <InlineFeedback
                    varName="answerFractionDenominator"
                    correctValue="8"
                    position="terminal"
                    successMessage="Perfect! You wrote the fraction correctly"
                    failureMessage="Check the pizza again."
                    hint="Count the total number of slices"
                >
                    <InlineClozeInput
                        varName="answerFractionDenominator"
                        correctAnswer="8"
                        {...clozePropsFromDefinition(getVariableInfo("answerFractionDenominator"))}
                    />
                </InlineFeedback>
            </EditableParagraph>
        </Block>
        <Block id="fractions-question-visual-pizza" padding="sm" hasVisualization>
            <QuizPizza coloured={3} total={8} />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-fractions-conclusion" maxWidth="xl">
        <Block id="fractions-conclusion" padding="md">
            <EditableParagraph id="para-fractions-conclusion" blockId="fractions-conclusion">
                <strong>Congratulations!</strong> You have learned what a fraction is and can
                identify the numerator and denominator. Keep practising, and soon fractions will
                feel as easy as sharing a pizza!
            </EditableParagraph>
        </Block>
    </StackLayout>,
];

// ============================================
// EXPORT ALL BLOCKS
// ============================================
export const fractionsIntroBlocks: ReactElement[] = [
    ...section1Blocks,
    ...section2Blocks,
    ...section3Blocks,
    ...section4Blocks,
];
