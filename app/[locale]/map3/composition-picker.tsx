const compositionOptions = [
    "zigZag",
    "stormEye",
    "curves",
    "bonfire",
    "digitalOrganism",
    "mudflatScatter",
    "cloudBubble",
    "paintBrush",
    "generativeStrings"
    
]

export default function pickRandomComposition(){

    const randomIndex = Math.floor(Math.random() * compositionOptions.length);
    const randomComposition = compositionOptions[randomIndex]

    return randomComposition

}