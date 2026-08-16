import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"
import { Sidebar } from "./ui/sidebar"

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.12, ease: "easeIn" } },
}

export default function Layout({ children }) {
  const router = useRouter()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <AnimatePresence mode="wait">
        <motion.main
          key={router.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
