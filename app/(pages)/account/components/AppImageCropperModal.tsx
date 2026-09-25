"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AppModal from "@/app/components/AppModal";
import AppButton from "@/app/components/AppButton";
import { useTranslation } from "@/app/utils/i18n";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RestartAltOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@mui/icons-material";

interface AppImageCropperModalProps {
  isOpen: boolean;
  imageFile: File | null;
  variant?: "user" | "company";
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const CROP_BOX_SIZE = 280;
const OUTPUT_SIZE = 512;

export default function AppImageCropperModal({
  isOpen,
  imageFile,
  variant = "user",
  onClose,
  onCropComplete,
}: AppImageCropperModalProps) {
  const { t } = useTranslation();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
  }>({
    clientX: 0,
    clientY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Load image object URL
  useEffect(() => {
    if (!isOpen || !imageFile) {
      setImageSrc(null);
      setNaturalSize(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImageSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const img = new window.Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      imgRef.current = img;
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [isOpen, imageFile]);

  // Compute scale and bounded offset
  const baseScale = naturalSize
    ? Math.max(
        CROP_BOX_SIZE / naturalSize.width,
        CROP_BOX_SIZE / naturalSize.height,
      )
    : 1;

  const currentScale = baseScale * zoom;
  const displayWidth = naturalSize
    ? naturalSize.width * currentScale
    : CROP_BOX_SIZE;
  const displayHeight = naturalSize
    ? naturalSize.height * currentScale
    : CROP_BOX_SIZE;

  const maxOffsetX = Math.max(0, (displayWidth - CROP_BOX_SIZE) / 2);
  const maxOffsetY = Math.max(0, (displayHeight - CROP_BOX_SIZE) / 2);

  const clampedX = Math.min(maxOffsetX, Math.max(-maxOffsetX, offset.x));
  const clampedY = Math.min(maxOffsetY, Math.max(-maxOffsetY, offset.y));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      offsetX: clampedX,
      offsetY: clampedY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    const newX = dragStartRef.current.offsetX + dx;
    const newY = dragStartRef.current.offsetY + dy;

    setOffset({
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, newX)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, newY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(3, Math.max(1, +(prev + delta).toFixed(2))));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleCrop = useCallback(() => {
    if (!naturalSize || !imgRef.current || !imageFile) return;

    try {
      setIsProcessing(true);

      const cropXInDisplay = (displayWidth - CROP_BOX_SIZE) / 2 - clampedX;
      const cropYInDisplay = (displayHeight - CROP_BOX_SIZE) / 2 - clampedY;

      const naturalCropX = Math.max(0, cropXInDisplay / currentScale);
      const naturalCropY = Math.max(0, cropYInDisplay / currentScale);
      const naturalCropSize = Math.min(
        CROP_BOX_SIZE / currentScale,
        naturalSize.width - naturalCropX,
        naturalSize.height - naturalCropY,
      );

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Draw high quality image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        imgRef.current,
        naturalCropX,
        naturalCropY,
        naturalCropSize,
        naturalCropSize,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = imageFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const croppedFile = new File([blob], fileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            onCropComplete(croppedFile);
            onClose();
          }
          setIsProcessing(false);
        },
        "image/jpeg",
        0.92,
      );
    } catch {
      setIsProcessing(false);
    }
  }, [
    naturalSize,
    imageFile,
    displayWidth,
    displayHeight,
    clampedX,
    clampedY,
    currentScale,
    onCropComplete,
    onClose,
  ]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("labels.account.crop_modal_title")}
      className="max-w-md! w-full"
    >
      <div className="flex flex-col items-center gap-4 pt-1">
        <span className="text-xs text-label text-center">
          {t("labels.account.crop_modal_instruction")}
        </span>

        <div
          className="relative w-[280px] h-[280px] rounded-xs overflow-hidden bg-black/90 shadow-inner select-none cursor-grab active:cursor-grabbing touch-none border-2 border-primary/50 flex items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="absolute pointer-events-none max-w-none transition-none"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                transform: `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`,
                left: "50%",
                top: "50%",
              }}
            />
          )}

          {variant === "user" && (
            <div className="absolute inset-0 rounded-full border-2 border-white/80 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          )}

          {variant === "company" && (
            <div className="absolute inset-0 border border-white/40 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full max-w-[280px] px-1">
          <button
            type="button"
            onClick={() =>
              setZoom((prev) => Math.max(1, +(prev - 0.2).toFixed(2)))
            }
            className="text-label hover:text-foreground transition-colors p-1 cursor-pointer"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOutOutlined style={{ fontSize: 20 }} />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
            aria-label="Zoom"
          />

          <button
            type="button"
            onClick={() =>
              setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(2)))
            }
            className="text-label hover:text-foreground transition-colors p-1 cursor-pointer"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomInOutlined style={{ fontSize: 20 }} />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="text-label hover:text-foreground transition-colors p-1 ml-1 cursor-pointer"
            title={t("labels.account.crop_reset")}
            aria-label={t("labels.account.crop_reset")}
          >
            <RestartAltOutlined style={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 w-full pt-2 border-t border-border">
          <AppButton
            type="button"
            color="transparent"
            flat
            onClick={onClose}
            disabled={isProcessing}
            className="gap-1.5 text-xs"
          >
            <CloseOutlined style={{ fontSize: 16 }} />
            <span>{t("labels.all.cancel")}</span>
          </AppButton>

          <AppButton
            type="button"
            color="primary-3"
            onClick={handleCrop}
            disabled={isProcessing || !imageSrc}
            className="gap-1.5 text-xs px-4"
          >
            <CheckOutlined style={{ fontSize: 16 }} />
            <span>
              {isProcessing
                ? t("labels.all.saving")
                : t("labels.account.crop_apply")}
            </span>
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}
