"use client"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"

type CompositionContainerProps = {
    isOpen:boolean,
    children:ReactNode,
    closeButton: ReactNode
}

export default  function CompositionModal({isOpen, closeButton, children}:CompositionContainerProps){

    return (
        <div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute w-svw h-svh top-0"
                        initial={{opacity:0}}
                        animate={{opacity:1}}
                        exit={{opacity:0}}
                        transition={{duration:1.5}}
                        >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}