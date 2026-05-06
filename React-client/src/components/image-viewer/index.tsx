import { Modal, ModalContent, ModalBody } from "@heroui/react"
import { motion, useMotionValue } from "framer-motion"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  MdZoomIn,
  MdZoomOut,
  MdClose,
  MdRestartAlt,
} from "react-icons/md"
import { IoChevronBack, IoChevronForward } from "react-icons/io5"
import { PostImage } from "../../app/types"
import { BASE_URL } from "../../constants"

type Props = {
  images: PostImage[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export const ImageViewer = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex)
  }, [isOpen, initialIndex])

  const resetView = useCallback(() => {
    setScale(1)
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleClose = useCallback(() => {
    resetView()
    onClose()
  }, [resetView, onClose])

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      resetView()
    },
    [resetView],
  )

  const zoom = useCallback(
    (factor: number) => {
      setScale((prev) => {
        const next = Math.min(Math.max(prev * factor, 0.3), 5)
        if (next <= 1) {
          x.set(0)
          y.set(0)
        }
        return next
      })
    },
    [x, y],
  )

  // Non-passive wheel listener for zoom (passive: false lets us preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el || !isOpen) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoom(e.deltaY < 0 ? 1.15 : 0.87)
    }
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [isOpen, zoom])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowLeft" && images.length > 1)
        goTo((currentIndex - 1 + images.length) % images.length)
      if (e.key === "ArrowRight" && images.length > 1)
        goTo((currentIndex + 1) % images.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, currentIndex, images.length, handleClose, goTo])

  if (!images.length) return null

  const dragConstraints =
    scale > 1
      ? {
          left: -(window.innerWidth * (scale - 1)) / 2,
          right: (window.innerWidth * (scale - 1)) / 2,
          top: -(window.innerHeight * (scale - 1)) / 2,
          bottom: (window.innerHeight * (scale - 1)) / 2,
        }
      : { left: 0, right: 0, top: 0, bottom: 0 }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      hideCloseButton
      classNames={{
        wrapper: "bg-black/90 backdrop-blur-sm",
        base: "bg-transparent shadow-none max-w-none m-0 rounded-none",
        body: "p-0",
      }}
    >
      <ModalContent>
        <ModalBody>
          <div
            ref={containerRef}
            className="relative w-screen h-screen flex items-center justify-center overflow-hidden"
            onClick={handleClose}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors"
            >
              <MdClose size={22} />
            </button>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 text-white bg-black/50 rounded-full px-3 py-1 text-sm select-none">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Prev */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goTo((currentIndex - 1 + images.length) % images.length)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 rounded-full p-3 hover:bg-black/80 transition-colors"
              >
                <IoChevronBack size={22} />
              </button>
            )}

            {/* Next */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goTo((currentIndex + 1) % images.length)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 rounded-full p-3 hover:bg-black/80 transition-colors"
              >
                <IoChevronForward size={22} />
              </button>
            )}

            {/* Draggable + zoomable image */}
            <motion.div
              drag={scale > 1}
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={dragConstraints}
              style={{ x, y }}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center"
            >
              <img
                key={currentIndex}
                src={`${BASE_URL}${images[currentIndex].url}`}
                alt="full size"
                draggable={false}
                style={{
                  transform: `scale(${scale})`,
                  transition: "transform 0.15s ease",
                  maxWidth: "90vw",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  cursor: scale > 1 ? "grab" : "default",
                  userSelect: "none",
                }}
              />
            </motion.div>

            {/* Bottom controls */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-black/60 rounded-full px-4 py-2 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => zoom(0.8)}
                className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10"
                title="Уменьшить"
              >
                <MdZoomOut size={20} />
              </button>
              <span className="text-white text-sm min-w-[52px] text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => zoom(1.25)}
                className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10"
                title="Увеличить"
              >
                <MdZoomIn size={20} />
              </button>
              <div className="w-px h-4 bg-white/30 mx-2" />
              <button
                onClick={resetView}
                className="text-white hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-white/10"
                title="Сбросить"
              >
                <MdRestartAlt size={20} />
              </button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}